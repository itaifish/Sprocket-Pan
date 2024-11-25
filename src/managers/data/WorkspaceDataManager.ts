import { log } from '../../utils/logging';
import { path } from '@tauri-apps/api';
import {
	WorkspaceData,
	HistoricalEndpointResponse,
	WorkspaceMetadata,
	UiMetadata,
} from '../../types/application-data/application-data';
import swaggerParseManager from '../parsers/SwaggerParseManager';
import { noHistoryReplacer } from '../../utils/functions';
import { dateTimeReviver } from '../../utils/json-parse';
import { saveUpdateManager } from '../SaveUpdateManager';
import { postmanParseManager } from '../parsers/postman/PostmanParseManager';
import { insomniaParseManager } from '../parsers/InsomniaParseManager';
import { FileSystemWorker } from '../file-system/FileSystemWorker';
import { fileSystemManager } from '../file-system/FileSystemManager';

export const defaultWorkspaceData: WorkspaceData = {
	services: {},
	endpoints: {},
	requests: {},
	environments: {},
	scripts: {},
	selectedEnvironment: undefined,
	metadata: undefined,
	uiMetadata: {
		idSpecific: {},
	},
	settings: {
		debugLogs: true,
		zoomLevel: 100,
		timeoutDurationMS: 1_000 * 30,
		scriptTimeoutDurationMS: 1_000 * 10,
		autoSaveIntervalMS: 60_000 * 5,
		defaultTheme: 'system-default',
		maxHistoryLength: -1,
		displayVariableNames: true,
		scriptRunnerStrategy: {
			pre: ['service', 'endpoint', 'request'],
			post: ['request', 'endpoint', 'service'],
		},
		listStyle: 'default',
	},
	version: saveUpdateManager.getCurrentVersion(),
};

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

	public static async saveData(data: WorkspaceData) {
		const selectedWorkspace = data.metadata;
		const paths = this.getWorkspacePath(selectedWorkspace?.fileName);
		const { metadata, uiMetadata, ...noMetadataData } = data;

		const saveData = FileSystemWorker.tryUpdateFile(paths.data, JSON.stringify(noMetadataData, noHistoryReplacer));
		const saveHistory = FileSystemWorker.tryUpdateFile(
			paths.history,
			JSON.stringify(
				Object.values(data.requests).map((request) => {
					return { id: request.id, history: request.history };
				}),
			),
		);
		const saveMetadata = FileSystemWorker.tryUpdateFile(
			paths.metadata,
			JSON.stringify(metadata == null ? null : { ...metadata, lastModified: new Date().getTime() }),
		);
		const saveUiMetadata = FileSystemWorker.tryUpdateFile(paths.uiMetadata, JSON.stringify(uiMetadata));

		const results = await Promise.all([saveData, saveHistory, saveMetadata, saveUiMetadata]);
		if (results.includes('doesNotExist')) {
			throw new Error('could not save one or more categories of data, file(s) did not exist');
		}
	}

	public static getWorkspacePath(workspace: string = 'default') {
		const root = `${FileSystemWorker.DATA_FOLDER_NAME}${path.sep}${workspace}`;
		const base = `${root}${path.sep}${FileSystemWorker.DATA_FILE_NAME}`;
		return {
			root,
			data: `${base}.json`,
			history: `${base}_history.json`,
			metadata: `${base}_metadata.json`,
			uiMetadata: `${base}_ui_metadata`,
		};
	}

	public static async initializeWorkspace(workspace?: WorkspaceMetadata) {
		const folderStatus = await fileSystemManager.createDataFolderIfNotExists();
		const fileStatus = await this.createDataFilesIfNotExist(workspace);
		if (folderStatus === 'alreadyExists' && fileStatus === 'alreadyExists') {
			try {
				return await this.loadDataFromFile(workspace);
			} catch (e) {
				log.error((e as Error).message);
			}
		}
	}

	private static async loadDataFromFile(workspace: WorkspaceMetadata | undefined) {
		const paths = this.getWorkspacePath(workspace?.fileName);

		const [data, metadata, history, uiMetadata] = await Promise.all([
			FileSystemWorker.readTextFile(paths.data),
			FileSystemWorker.readTextFile(paths.metadata),
			FileSystemWorker.readTextFile(paths.history),
			FileSystemWorker.readTextFile(paths.uiMetadata),
		]);

		const parsedData = JSON.parse(data, dateTimeReviver) as WorkspaceData;
		const parsedHistory = JSON.parse(history, dateTimeReviver) as {
			id: string;
			history: HistoricalEndpointResponse[];
		}[];
		parsedHistory.forEach((responseHistory) => {
			parsedData.requests[responseHistory.id].history = responseHistory?.history ?? [];
		});
		parsedData.metadata = JSON.parse(metadata, dateTimeReviver) as WorkspaceMetadata;
		parsedData.uiMetadata = JSON.parse(uiMetadata, dateTimeReviver) as UiMetadata;
		saveUpdateManager.update(parsedData);
		return parsedData;
	}

	/**
	 * This function creates a data file if it does not already exist.
	 * @returns 'created' if a new file is created, 'alreadyExists' if not
	 */
	private static async createDataFilesIfNotExist(workspace?: WorkspaceMetadata) {
		log.trace(`createDataFolderIfNotExists called`);
		const { metadata, uiMetadata, ...defaultData } = defaultWorkspaceData;
		const paths = this.getWorkspacePath(workspace?.fileName);
		const pathsAndDataToCreate = [
			{ path: paths.data, content: defaultData },
			{ path: paths.history, content: [] },
			{ path: paths.metadata, content: workspace ?? metadata },
			{ path: paths.uiMetadata, content: uiMetadata },
		];
		const createIfNotExistsPromises = pathsAndDataToCreate.map(({ path, content }) => {
			const action = async () => {
				const doesExist = await FileSystemWorker.exists(path);
				if (!doesExist) {
					log.debug(`File does not exist, creating...`);
					await FileSystemWorker.writeFile(path, JSON.stringify(content));
					// we only care if we had to create a new metadata file as to whether or not to use default data
					if (path !== paths.metadata) {
						return 'alreadyExists' as const;
					}
					return 'created' as const;
				} else {
					log.trace(`File already exists, no need to create`);
					return 'alreadyExists' as const;
				}
			};
			return action();
		});
		const results = await Promise.all(createIfNotExistsPromises);
		return results.includes('created') ? 'created' : 'alreadyExists';
	}
}
