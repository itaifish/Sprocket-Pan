import { DEFAULT_SETTINGS } from '@/constants/defaults';
import {
	WorkspaceData,
	EndpointRequest,
	WorkspaceMetadata,
	WorkspaceSyncedData,
	Endpoint,
	Service,
} from '@/types/data/workspace';
import { nullifyProperties } from '@/utils/functions';
import { log } from '@/utils/logging';
import { path } from '@tauri-apps/api';
import { save } from '@tauri-apps/api/dialog';
import { writeTextFile } from '@tauri-apps/api/fs';
import { FileSystemManager } from '../file-system/FileSystemManager';
import { FileSystemWorker } from '../file-system/FileSystemWorker';
import { insomniaParseManager } from '../parsers/InsomniaParseManager';
import { postmanParseManager } from '../parsers/postman/PostmanParseManager';
import swaggerParseManager from '../parsers/SwaggerParseManager';
import { SaveUpdateManager } from '../SaveUpdateManager';
import { defaultWorkspaceMetadata } from './GlobalDataManager';
import { getDefinedWorkspaceItemType } from '@/utils/getters';
import { mergeDeep } from '@/utils/variables';

export const defaultWorkspaceSyncedData: WorkspaceSyncedData = {
	services: {},
	endpoints: {},
	requests: {},
	environments: {},
	scripts: {},
	secrets: [],
};

export const defaultWorkspaceData: WorkspaceData = {
	...defaultWorkspaceSyncedData,
	history: {},
	selectedEnvironment: undefined,
	metadata: defaultWorkspaceMetadata,
	uiMetadata: {
		idSpecific: {},
	},
	settings: DEFAULT_SETTINGS,
	version: SaveUpdateManager.getCurrentVersion(),
	syncMetadata: { items: {} },
	selectedServiceEnvironments: {},
};

export interface OrphanData {
	endpoints: { orphan: Endpoint; parent?: Service }[];
	requests: { orphan: EndpointRequest; parent?: Endpoint }[];
}

export class WorkspaceDataManager {
	public static loadSwaggerFile(url: string) {
		return swaggerParseManager.parseSwaggerFile('filePath', url);
	}

	public static loadPostmanFile(url: string) {
		return postmanParseManager.parsePostmanFile('filePath', url);
	}

	public static loadInsomniaFile(url: string) {
		return insomniaParseManager.parseInsomniaFile('filePath', url);
	}

	public static async exportData(data?: WorkspaceData) {
		if (data == null) {
			throw new Error('export data called with no data');
		}
		const filePath = await save({
			title: `Save ${data.metadata?.name} Workspace`,
			filters: [
				{ name: 'Sprocketpan Workspace', extensions: ['json'] },
				{ name: 'All Files', extensions: ['*'] },
			],
		});

		if (!filePath) {
			return;
		}

		const dataToWrite = JSON.stringify(
			{ ...data, secrets: data.secrets.map(({ key }) => ({ key, value: '' })) },
			nullifyProperties<WorkspaceData & EndpointRequest>('history', 'settings', 'metadata', 'uiMetadata'),
		);

		await writeTextFile(filePath, dataToWrite);
	}

	public static async saveData(allData: WorkspaceData) {
		const { data, sync, location } = this.splitWorkspace(allData);
		const {
			metadata: { fileName, ...metadata },
			uiMetadata,
			secrets,
			history,
			...strippedData
		} = data;

		const paths = this.getWorkspacePath(fileName);

		const promises = [
			FileSystemWorker.upsertFile(paths.data, JSON.stringify(strippedData)),
			FileSystemWorker.upsertFile(paths.history, JSON.stringify(history)),
			FileSystemWorker.upsertFile(paths.metadata, JSON.stringify({ ...metadata, lastModified: new Date().getTime() })),
			FileSystemWorker.upsertFile(paths.uiMetadata, JSON.stringify(uiMetadata)),
			FileSystemWorker.upsertFile(paths.secrets, JSON.stringify(secrets)),
		];

		if (location != null) {
			const syncContent = JSON.stringify(sync);
			promises.push(FileSystemWorker.upsertFile(location, syncContent));
			promises.push(FileSystemWorker.upsertFile(paths.syncBackup, syncContent));
		}

		await Promise.all(promises);
	}

	public static findOrphans(data: WorkspaceData) {
		return {
			endpoints: Object.values(data.endpoints).filter((endpoint) => data.services[endpoint.serviceId] == null),
			requests: Object.values(data.requests).filter((request) => data.endpoints[request.endpointId] == null),
		};
	}

	public static async processOrphans(data: WorkspaceData): Promise<OrphanData> {
		const list = this.findOrphans(data);
		const endpoints: OrphanData['endpoints'] = list.endpoints.map((orphan) => ({ orphan }));
		const requests: OrphanData['requests'] = list.requests.map((orphan) => ({ orphan }));
		const paths = this.getWorkspacePath(data.metadata.fileName);
		if (this.getSyncLocation(data) != null && (await FileSystemWorker.exists(paths.syncBackup))) {
			const backup = JSON.parse(await FileSystemWorker.readTextFile(paths.syncBackup)) as WorkspaceSyncedData;
			endpoints.forEach((endpoint) => {
				endpoint.parent = backup.services[endpoint.orphan.serviceId];
			});
			requests.forEach((request) => {
				request.parent = backup.endpoints[request.orphan.endpointId];
			});
		}
		return { endpoints, requests };
	}

	public static getWorkspacePath(folder: string) {
		if (folder == null) {
			throw new Error('workspace folder path must be provided');
		}
		const root = `${FileSystemWorker.DATA_FOLDER_NAME}${path.sep}${folder}`;
		const base = `${root}${path.sep}${FileSystemWorker.DATA_FILE_NAME}`;
		return {
			root,
			data: `${base}.json`,
			history: `${base}_history.json`,
			metadata: `${base}_metadata.json`,
			uiMetadata: `${base}_ui_metadata.json`,
			secrets: `${base}_secrets.json`,
			syncBackup: `${base}_sync_backup.json`,
		};
	}

	public static async initializeWorkspace(workspace: WorkspaceMetadata) {
		await FileSystemManager.createDataFolderIfNotExists();
		await this.createDataFilesIfNotExist(workspace);
		return await this.loadDataFromFile(workspace);
	}

	private static async loadDataFromFile(workspace: WorkspaceMetadata) {
		const paths = this.getWorkspacePath(workspace.fileName);

		const [data, metadata, history, uiMetadata, secrets] = await Promise.all([
			FileSystemWorker.readTextFile(paths.data),
			FileSystemWorker.readTextFile(paths.metadata),
			FileSystemWorker.readTextFile(paths.history),
			FileSystemWorker.readTextFile(paths.uiMetadata),
			FileSystemWorker.readTextFile(paths.secrets),
		]);

		let parsedData = JSON.parse(data) as WorkspaceData;
		parsedData.history = JSON.parse(history);
		parsedData.metadata = {
			fileName: workspace.fileName,
			...JSON.parse(metadata),
		};
		parsedData.uiMetadata = JSON.parse(uiMetadata);
		parsedData.secrets = JSON.parse(secrets);
		const syncLocation = this.getSyncLocation(parsedData);
		if (syncLocation != null) {
			const parsedSync = JSON.parse(await FileSystemWorker.readTextFile(syncLocation));
			parsedData = mergeDeep(parsedSync, parsedData);
		}
		SaveUpdateManager.update(parsedData);
		return parsedData;
	}

	private static splitWorkspace(data: WorkspaceData) {
		const location = this.getSyncLocation(data);
		if (location == null) {
			return { data };
		}
		const retData: WorkspaceData = structuredClone(data);
		const syncData: WorkspaceSyncedData = structuredClone(defaultWorkspaceSyncedData);
		Object.entries(data.syncMetadata.items).forEach(([key, value]) => {
			if (value) {
				const type = getDefinedWorkspaceItemType(data, key);
				delete retData[type][key];
				syncData[type][key] = data[type][key];
			}
		});
		return { data: retData, sync: syncData, location };
	}

	private static getSyncLocation(data: WorkspaceData) {
		const sync = data.settings.data?.sync;
		return sync?.enabled && sync?.location != null && sync.location !== ''
			? `${sync.location}${path.sep}data_sync.json`
			: null;
	}

	/**
	 * This function creates the data folder and workspace data files if they do not already exist.
	 * @returns true if it created at least one file or folder, false if not.
	 */
	private static async createDataFilesIfNotExist({ fileName, ...workspace }: WorkspaceMetadata) {
		log.trace(`createDataFilesIfNotExist called`);
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { metadata, uiMetadata, ...defaultData } = defaultWorkspaceData;
		const paths = this.getWorkspacePath(fileName);
		const promises = [
			FileSystemManager.createFileIfNotExists(paths.data, defaultData),
			FileSystemManager.createFileIfNotExists(paths.history, []),
			FileSystemManager.createFileIfNotExists(paths.uiMetadata, uiMetadata),
			FileSystemManager.createFileIfNotExists(paths.metadata, workspace),
			FileSystemManager.createFileIfNotExists(paths.secrets, []),
		];
		const results = await Promise.all(promises);
		return results.includes(true);
	}
}
