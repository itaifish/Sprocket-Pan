import { BaseDirectory, createDir, exists, readTextFile, writeFile } from '@tauri-apps/api/fs';
import { log } from '../utils/logging';
import { path } from '@tauri-apps/api';
import {
	ApplicationData,
	HistoricalEndpointResponse,
	WorkspaceMetadata,
} from '../types/application-data/application-data';
import swaggerParseManager from './SwaggerParseManager';
import { noHistoryAndMetadataReplacer } from '../utils/functions';
import { dateTimeReviver } from '../utils/json-parse';

export const defaultApplicationData: ApplicationData = {
	services: {},
	endpoints: {},
	requests: {},
	environments: {},
	selectedEnvironment: undefined,
	workspaceMetadata: undefined,
	settings: {
		debugLogs: true,
		zoomLevel: 100,
		timeoutDurationMS: 1_000 * 30,
		defaultTheme: 'system-default',
		maxHistoryLength: -1,
		displayVariableNames: true,
		scriptRunnerStrategy: {
			pre: ['service', 'endpoint', 'request'],
			post: ['request', 'endpoint', 'service'],
		},
	},
};

export class ApplicationDataManager {
	public static readonly DEFAULT_DIRECTORY = BaseDirectory.AppLocalData;
	public static readonly DATA_FOLDER_NAME = 'data' as const;
	public static readonly DATA_FILE_NAME = 'data' as const;
	private static readonly PATH =
		`${ApplicationDataManager.DATA_FOLDER_NAME}${path.sep}${ApplicationDataManager.DATA_FILE_NAME}.json` as const;
	private static readonly HISTORY_PATH =
		`${ApplicationDataManager.DATA_FOLDER_NAME}${path.sep}${ApplicationDataManager.DATA_FILE_NAME}_history.json` as const;
	private static readonly METADATA_PATH =
		`${ApplicationDataManager.DATA_FOLDER_NAME}${path.sep}${ApplicationDataManager.DATA_FILE_NAME}_metadata.json` as const;
	public static readonly INSTANCE = new ApplicationDataManager();

	private constructor() {}

	public loadSwaggerFile(url: string) {
		return swaggerParseManager.parseSwaggerFile('filePath', url);
	}

	public async saveData(data: ApplicationData) {
		const selectedWorkspace = data.workspaceMetadata;
		const paths = this.getWorkspacePath(selectedWorkspace?.fileName);
		const saveData = async () => {
			const doesExist = await exists(paths.data, { dir: ApplicationDataManager.DEFAULT_DIRECTORY });
			if (!doesExist) {
				log.warn(`File does not exist, exiting...`);
				return 'doesNotExist' as const;
			} else {
				log.trace(`File already exists, updating...`);
				await writeFile(
					{ contents: JSON.stringify(data, noHistoryAndMetadataReplacer, 4), path: paths.data },
					{ dir: ApplicationDataManager.DEFAULT_DIRECTORY },
				);
			}
		};
		const saveHistory = async () => {
			const doesExist = await exists(paths.history, {
				dir: ApplicationDataManager.DEFAULT_DIRECTORY,
			});
			if (!doesExist) {
				log.warn(`File does not exist, exiting...`);
				return 'doesNotExist' as const;
			} else {
				log.trace(`File already exists, updating...`);
				const historyOnly = Object.values(data.requests).map((request) => {
					return { id: request.id, history: request.history };
				});
				await writeFile(
					{
						contents: JSON.stringify(historyOnly, undefined, 4),
						path: paths.history,
					},
					{ dir: ApplicationDataManager.DEFAULT_DIRECTORY },
				);
			}
		};

		const saveMetadata = async () => {
			const doesExist = await exists(paths.metadata, {
				dir: ApplicationDataManager.DEFAULT_DIRECTORY,
			});
			if (!doesExist) {
				log.warn(`File does not exist, exiting...`);
				return 'doesNotExist' as const;
			} else {
				log.trace(`File already exists, updating...`);
				let metadata = data.workspaceMetadata;
				if (metadata != null) {
					metadata = { ...metadata, lastModified: new Date().getTime() };
				}
				await writeFile(
					{
						contents: JSON.stringify(metadata, undefined, 4),
						path: paths.metadata,
					},
					{ dir: ApplicationDataManager.DEFAULT_DIRECTORY },
				);
			}
		};

		const results = await Promise.all([saveData(), saveHistory(), saveMetadata()]);
		if (results.includes('doesNotExist')) {
			throw new Error('could not save one or more categories of data, file(s) did not exist');
		}
	}

	public getWorkspacePath(workspace?: string) {
		if (workspace == null) {
			return {
				root: `${ApplicationDataManager.DATA_FOLDER_NAME}${path.sep}` as const,
				data: ApplicationDataManager.PATH,
				history: ApplicationDataManager.HISTORY_PATH,
				metadata: ApplicationDataManager.METADATA_PATH,
			};
		}
		const root = `${ApplicationDataManager.DATA_FOLDER_NAME}${path.sep}${workspace}` as const;
		return {
			root,
			data: `${root}${path.sep}${ApplicationDataManager.DATA_FILE_NAME}.json` as const,
			history: `${root}${path.sep}${ApplicationDataManager.DATA_FILE_NAME}_history.json` as const,
			metadata: `${root}${path.sep}${ApplicationDataManager.DATA_FILE_NAME}_metadata.json` as const,
		};
	}

	public async initializeWorkspace(workspace?: WorkspaceMetadata) {
		const folderStatus = await this.createDataFolderIfNotExists();
		const fileStatus = await this.createDataFilesIfNotExist(workspace);
		if (folderStatus === 'alreadyExists' && fileStatus === 'alreadyExists') {
			try {
				return await this.loadDataFromFile(workspace);
			} catch (e) {
				log.error((e as Error).message);
			}
		}
	}

	private async loadDataFromFile(workspace: WorkspaceMetadata | undefined) {
		const paths = this.getWorkspacePath(workspace?.fileName);
		const contentsTask = readTextFile(paths.data, {
			dir: ApplicationDataManager.DEFAULT_DIRECTORY,
		});
		const metadataTask = readTextFile(paths.metadata, {
			dir: ApplicationDataManager.DEFAULT_DIRECTORY,
		});
		const history = await readTextFile(paths.history, {
			dir: ApplicationDataManager.DEFAULT_DIRECTORY,
		});
		const contents = await contentsTask;
		const metadata = await metadataTask;

		const data = JSON.parse(contents, dateTimeReviver) as ApplicationData;
		const parsedHistory = JSON.parse(history, dateTimeReviver) as {
			id: string;
			history: HistoricalEndpointResponse[];
		}[];
		parsedHistory.forEach((responseHistory) => {
			data.requests[responseHistory.id].history = responseHistory?.history ?? [];
		});
		data.workspaceMetadata = JSON.parse(metadata, dateTimeReviver) as WorkspaceMetadata;
		return data;
	}

	/**
	 * This function creates a data folder if it does not already exist.
	 * @returns 'created' if a new folder is created, 'alreadyExists' if not
	 */
	private async createDataFolderIfNotExists() {
		log.trace(`createDataFolderIfNotExists called`);
		const dataFolderLocalPath = ApplicationDataManager.DATA_FOLDER_NAME;
		const doesExist = await exists(dataFolderLocalPath, {
			dir: ApplicationDataManager.DEFAULT_DIRECTORY,
		});
		if (!doesExist) {
			log.debug(`Folder does not exist, creating...`);
			await createDir(dataFolderLocalPath, {
				dir: ApplicationDataManager.DEFAULT_DIRECTORY,
				recursive: true,
			});
			return 'created' as const;
		} else {
			log.trace(`Folder already exists, no need to create`);
			return 'alreadyExists' as const;
		}
	}
	/**
	 * This function creates a data file if it does not already exist.
	 * @returns 'created' if a new file is created, 'alreadyExists' if not
	 */
	private async createDataFilesIfNotExist(workspace?: WorkspaceMetadata) {
		log.trace(`createDataFolderIfNotExists called`);
		const paths = this.getWorkspacePath(workspace?.fileName);
		const pathsAndDataToCreate = [
			{ path: paths.data, content: defaultApplicationData },
			{ path: paths.history, content: [] },
			{ path: paths.metadata, content: workspace ?? defaultApplicationData.workspaceMetadata },
		];
		const createIfNotExistsPromises = pathsAndDataToCreate.map(({ path, content }) => {
			const action = async () => {
				const doesExist = await exists(path, {
					dir: ApplicationDataManager.DEFAULT_DIRECTORY,
				});
				if (!doesExist) {
					log.debug(`File does not exist, creating...`);
					await writeFile(
						{ contents: JSON.stringify(content), path },
						{ dir: ApplicationDataManager.DEFAULT_DIRECTORY },
					);
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

export const applicationDataManager = ApplicationDataManager.INSTANCE;
