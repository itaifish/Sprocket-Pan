import { DEFAULT_SETTINGS } from '@/constants/defaults';
import { UiMetadata } from '@/types/data/shared';
import { WorkspaceData, EndpointRequest, WorkspaceMetadata, HistoricalEndpointResponse } from '@/types/data/workspace';
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

export const defaultWorkspaceData: WorkspaceData = {
	services: {},
	endpoints: {},
	requests: {},
	environments: {},
	scripts: {},
	secrets: [],
	selectedEnvironment: undefined,
	metadata: defaultWorkspaceMetadata,
	uiMetadata: {
		idSpecific: {},
	},
	settings: DEFAULT_SETTINGS,
	version: SaveUpdateManager.getCurrentVersion(),
};

export class WorkspaceDataManager {
	private static noHistoryReplacer = nullifyProperties('history');

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

	public static async saveData(data: WorkspaceData) {
		const {
			metadata: { fileName, ...metadata },
			uiMetadata,
			secrets,
			...strippedData
		} = data;

		const paths = this.getWorkspacePath(fileName);

		const saveData = FileSystemWorker.tryUpdateFile(paths.data, JSON.stringify(strippedData, this.noHistoryReplacer));
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

		const saveSecrets = FileSystemWorker.tryUpdateFile(paths.secrets, JSON.stringify(secrets));

		const results = await Promise.all([saveData, saveHistory, saveMetadata, saveUiMetadata, saveSecrets]);

		if (results.includes(false)) {
			throw new Error('could not save one or more categories of data, file(s) did not exist');
		}
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
		};
	}

	public static async initializeWorkspace(workspace: WorkspaceMetadata) {
		try {
			await FileSystemManager.createDataFolderIfNotExists();
			await this.createDataFilesIfNotExist(workspace);
			return await this.loadDataFromFile(workspace);
		} catch (err) {
			log.error(err);
			return null;
		}
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

		const parsedData = JSON.parse(data) as WorkspaceData;
		const parsedHistory = JSON.parse(history) as {
			id: string;
			history: HistoricalEndpointResponse[];
		}[];
		parsedHistory.forEach((responseHistory) => {
			parsedData.requests[responseHistory.id].history = responseHistory?.history ?? [];
		});
		parsedData.metadata = {
			fileName: workspace.fileName,
			...JSON.parse(metadata),
		} as WorkspaceMetadata;
		parsedData.uiMetadata = JSON.parse(uiMetadata) as UiMetadata;
		parsedData.secrets = JSON.parse(secrets);
		SaveUpdateManager.update(parsedData);
		return parsedData;
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
