import { BaseDirectory, createDir, exists, readTextFile, writeFile } from '@tauri-apps/api/fs';
import { log } from '../utils/logging';
import { path } from '@tauri-apps/api';
import {
	ApplicationData,
	EMPTY_ENVIRONMENT,
	EMPTY_HEADERS,
	EMPTY_QUERY_PARAMS,
	Endpoint,
	EndpointRequest,
	EndpointResponse,
	Environment,
	HistoricalEndpointResponse,
	NetworkFetchRequest,
	Service,
	WorkspaceMetadata,
} from '../types/application-data/application-data';
import swaggerParseManager from './SwaggerParseManager';
import { EventEmitter } from '@tauri-apps/api/shell';
import { v4 } from 'uuid';
import { TabType } from '../types/state/state';
import { tabsManager } from './TabsManager';
import { getDataArrayFromEnvKeys, noHistoryAndMetadataReplacer } from '../utils/functions';
import { TabsContextType } from './GlobalContextManager';
import { Settings } from '../types/settings/settings';
import { AuditLog } from './AuditLogManager';
import { dateTimeReviver } from '../utils/json-parse';

type DataEvent = 'update' | 'saved';

type UpdateType = {
	service: Partial<Service>;
	endpoint: Partial<Endpoint>;
	request: Partial<EndpointRequest>;
	environment: Partial<Environment>;
};

type AdditionalContextType<TTabType> = TTabType extends 'request'
	? { endpointId: string }
	: TTabType extends 'endpoint'
	? { serviceId: string }
	: undefined;

export class ApplicationDataManager extends EventEmitter<DataEvent> {
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

	private data: ApplicationData;
	private workspace?: string;

	private constructor() {
		super();
		this.data = ApplicationDataManager.getDefaultData();
		this.workspace = undefined;
		this.init();
	}

	public addNew<
		TTabType extends TabType,
		TAdditionalContext extends AdditionalContextType<TTabType> = AdditionalContextType<TTabType>,
	>(type: TTabType, additionalContext: TAdditionalContext, data: UpdateType[TTabType] = {}, emitUpdate = true) {
		data = structuredClone(data);
		let _exaustive: never;
		const newId = v4();
		let newDatum: Required<UpdateType[TTabType]> | null = null;
		switch (type) {
			case 'environment':
				this.data.environments[newId] = {
					__name: 'New Environment',
					...(data as UpdateType['environment']),
					__id: newId,
					__data: structuredClone((data as UpdateType['environment']).__data ?? []),
				} as Environment;
				newDatum = this.data.environments[newId] as unknown as Required<UpdateType[TTabType]>;
				break;
			case 'service':
				this.data.services[newId] = {
					name: 'New Service',
					description: 'This is a new service',
					version: '1.0.0',
					baseUrl: '',
					localEnvironments: {},
					...data,
					endpointIds: [],
					id: newId,
				};
				const endpointIds = (data as UpdateType['service'])?.endpointIds ?? [];
				endpointIds.forEach((endpointId) =>
					this.addNew('endpoint', { serviceId: newId }, this.data.endpoints[endpointId], false),
				);
				newDatum = this.data.services[newId] as unknown as Required<UpdateType[TTabType]>;
				break;
			case 'endpoint':
				const { serviceId } = additionalContext as { serviceId: string };
				this.data.endpoints[newId] = {
					url: '',
					verb: 'GET',
					baseHeaders: structuredClone(EMPTY_HEADERS),
					name: 'New Endpoint',
					baseQueryParams: structuredClone(EMPTY_QUERY_PARAMS),
					description: 'This is a new endpoint',
					...data,
					serviceId,
					requestIds: [],
					id: newId,
					defaultRequest: null,
				};
				this.data.services[serviceId]?.endpointIds?.push(newId);
				const requestIds = (data as UpdateType['endpoint'])?.requestIds ?? [];
				requestIds.forEach((requestId) => {
					this.addNew('request', { endpointId: newId }, this.data.requests[requestId], false);
				});
				newDatum = this.data.endpoints[newId] as unknown as Required<UpdateType[TTabType]>;
				break;
			case 'request':
				const { endpointId } = additionalContext as { endpointId: string };
				this.data.requests[newId] = {
					name: 'New Request',
					headers: structuredClone(EMPTY_HEADERS),
					queryParams: structuredClone(EMPTY_QUERY_PARAMS),
					body: undefined,
					bodyType: 'none',
					rawType: undefined,
					environmentOverride: structuredClone(EMPTY_ENVIRONMENT),
					...data,
					endpointId: endpointId,
					id: newId,
					history: [],
				};
				const endpointData = this.data.endpoints[endpointId];
				endpointData?.requestIds?.push(newId);
				if (endpointData?.defaultRequest == null) {
					endpointData.defaultRequest = newId;
				}
				newDatum = this.data.requests[newId] as unknown as Required<UpdateType[TTabType]>;
				break;
			default:
				_exaustive = type;
		}

		if (emitUpdate) {
			this.data = { ...this.data };
			this.emit('update');
		}
		return newDatum;
	}

	public setSettings(newSettings: Settings) {
		this.data.settings = newSettings;
		this.data = { ...this.data };
		this.emit('update');
	}

	public update<TTabType extends TabType>(updateType: TTabType, updateId: string, updateObj: UpdateType[TTabType]) {
		let dataToUpdate = this.data[`${updateType}s`][updateId];
		if (dataToUpdate == null) {
			log.warn(`Can't find ${updateType} ${updateId}`);
			return;
		}
		dataToUpdate = { ...dataToUpdate, ...updateObj } as any;
		if (updateType === 'environment') {
			const envDataToUpdate = dataToUpdate as Environment;
			Object.keys(dataToUpdate).forEach((key) => {
				if (envDataToUpdate[key] === undefined) {
					delete envDataToUpdate[key];
				}
			});
			envDataToUpdate.__data = getDataArrayFromEnvKeys(envDataToUpdate);
		}
		this.data[`${updateType}s`][updateId] = dataToUpdate;
		this.data = { ...this.data };
		this.emit('update');
	}

	public setEnvironment(updateId: string, newEnvironment: Environment) {
		this.data['environments'][updateId] = newEnvironment;
		this.data = { ...this.data };
		this.emit('update');
	}

	public addResponseToHistory(
		requestId: string,
		networkRequest: NetworkFetchRequest,
		response: EndpointResponse,
		auditLog?: AuditLog,
	) {
		const reqToUpdate = this.data.requests[requestId];
		if (reqToUpdate == null) {
			log.warn(`Can't find request ${requestId}`);
			return;
		}

		reqToUpdate.history.push({
			request: networkRequest,
			response,
			auditLog,
		});
		if (this.data.settings.maxHistoryLength > 0 && reqToUpdate.history.length > this.data.settings.maxHistoryLength) {
			reqToUpdate.history.shift();
		}
	}

	public delete(deleteType: TabType, id: string, tabsContext: TabsContextType, emitUpdate = true) {
		let _exaustive: never;
		tabsManager.closeTab(tabsContext, id);
		switch (deleteType) {
			case 'environment':
				delete this.data.environments[id];
				break;
			case 'service':
				const service = this.data.services[id];
				if (service) {
					service.endpointIds.forEach((endpointId) => this.delete('endpoint', endpointId, tabsContext, false));
				}
				delete this.data.services[id];
				break;
			case 'endpoint':
				const endpoint = this.data.endpoints[id];
				if (endpoint) {
					endpoint.requestIds.forEach((requestId) => this.delete('request', requestId, tabsContext, false));
					this.data.services[endpoint.serviceId].endpointIds = this.data.services[
						endpoint.serviceId
					].endpointIds.filter((endId) => endId != id);
				}
				delete this.data.endpoints[id];
				break;
			case 'request':
				const request = this.data.requests[id];
				if (request) {
					this.data.endpoints[request.endpointId].requestIds = this.data.endpoints[
						request.endpointId
					].requestIds.filter((reqId) => reqId != id);
				}
				delete this.data.requests[id];
				break;
			default:
				_exaustive = deleteType;
				break;
		}

		if (emitUpdate) {
			this.data = { ...this.data };
			this.emit('update');
		}
	}

	public setSelectedEnvironment(newEnvId: string | undefined) {
		this.data.selectedEnvironment = newEnvId;
		this.data = { ...this.data };
		this.emit('update');
	}

	public async loadSwaggerFile(url: string): Promise<void> {
		const newData = await swaggerParseManager.parseSwaggerFile('filePath', url);
		const data = structuredClone(this.getApplicationData());
		for (const type of ['services', 'endpoints', 'requests'] as const) {
			newData[type].forEach((x) => {
				data[type][x.id] = x;
			});
		}
		const result = await this.saveApplicationData(data);
		if (result === 'saved') {
			this.data = data;
			this.emit('update');
		}
	}

	public getApplicationData(): ApplicationData {
		return this.data;
	}

	static getDefaultData(): ApplicationData {
		return {
			services: {},
			endpoints: {},
			requests: {},
			environments: {},
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
			workspaceMetadata: {
				name: 'Default Workspace',
				description: 'The default workspace in SprocketPan',
				lastModified: new Date(),
			},
		};
	}

	/**
	 * Sets the workspace and reloads everything from disk
	 * @param workspace Either the workspace name, or undefined if you want the default workspace
	 */
	public setWorkspace(workspace?: string) {
		this.workspace = workspace;
		this.init();
	}

	private loadDataFromFile = async () => {
		const paths = this.getWorkspacePath();
		try {
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
		} catch (e) {
			console.error(e);
			return ApplicationDataManager.getDefaultData();
		}
	};

	/**
	 * This function creates a data folder if it does not already exist.
	 * @returns 'created' if a new folder is created, 'alreadyExists' if not, and 'error' if there was an error
	 */
	private createDataFolderIfNotExists = async () => {
		log.trace(`createDataFolderIfNotExists called`);
		const dataFolderLocalPath = ApplicationDataManager.DATA_FOLDER_NAME;
		try {
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
		} catch (e) {
			log.error(e);
			return 'error' as const;
		}
	};
	/**
	 * This function creates a data file if it does not already exist.
	 * @returns 'created' if a new file is created, 'alreadyExists' if not, and 'error' if there was an error
	 */
	private createDataFilesIfNotExist = async (fileContents: ApplicationData) => {
		log.trace(`createDataFolderIfNotExists called`);
		const paths = this.getWorkspacePath();
		const pathsToCreate = [paths.data, paths.history, paths.metadata];
		const createIfNotExistsPromises = pathsToCreate.map((path) => {
			const action = async () => {
				try {
					const doesExist = await exists(path, {
						dir: ApplicationDataManager.DEFAULT_DIRECTORY,
					});
					if (!doesExist) {
						log.debug(`File does not exist, creating...`);
						const content =
							path === paths.data ? fileContents : path === paths.metadata ? fileContents.workspaceMetadata : [];
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
				} catch (e) {
					log.error(e);
					return 'error' as const;
				}
			};
			return action();
		});
		const results = await Promise.all(createIfNotExistsPromises);
		return results.includes('error') ? 'error' : results.includes('created') ? 'created' : 'alreadyExists';
	};

	public saveApplicationData = async (applicationData: ApplicationData) => {
		const paths = this.getWorkspacePath();
		try {
			const saveData = async () => {
				const doesExist = await exists(paths.data, { dir: ApplicationDataManager.DEFAULT_DIRECTORY });
				if (!doesExist) {
					log.warn(`File does not exist, exiting...`);
					return 'doesNotExist' as const;
				} else {
					log.trace(`File already exists, updating...`);
					await writeFile(
						{ contents: JSON.stringify(applicationData, noHistoryAndMetadataReplacer, 4), path: paths.data },
						{ dir: ApplicationDataManager.DEFAULT_DIRECTORY },
					);
					this.emit('saved');
					return 'saved' as const;
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
					const historyOnly = Object.values(applicationData.requests).map((request) => {
						return { id: request.id, history: request.history };
					});
					await writeFile(
						{
							contents: JSON.stringify(historyOnly, undefined, 4),
							path: paths.history,
						},
						{ dir: ApplicationDataManager.DEFAULT_DIRECTORY },
					);
					this.emit('saved');
					return 'saved' as const;
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
					const metadata = applicationData.workspaceMetadata;
					if (metadata) {
						metadata.lastModified = new Date();
					}
					await writeFile(
						{
							contents: JSON.stringify(metadata, undefined, 4),
							path: paths.metadata,
						},
						{ dir: ApplicationDataManager.DEFAULT_DIRECTORY },
					);
					this.emit('saved');
					return 'saved' as const;
				}
			};

			const results = await Promise.all([saveData(), saveHistory(), saveMetadata()]);
			return results.includes('doesNotExist') ? 'doesNotExist' : 'saved';
		} catch (e) {
			log.error(e);
			return 'error' as const;
		}
	};

	private async init() {
		const defaultData = ApplicationDataManager.getDefaultData();
		try {
			const folderStatus = await this.createDataFolderIfNotExists();
			const fileStatus = await this.createDataFilesIfNotExist(defaultData);
			if (folderStatus === 'alreadyExists' && fileStatus === 'alreadyExists') {
				const data = await this.loadDataFromFile();
				this.data = data;
			} else {
				this.data = defaultData;
			}
		} catch (e) {
			console.error(e);
			this.data = defaultData;
		} finally {
			this.emit('update');
		}
	}

	public getWorkspacePath(workspace?: string, overrideUndefined = false) {
		let workspaceToUse = workspace ?? this.workspace;
		if (overrideUndefined && workspace === undefined) {
			workspaceToUse = undefined;
		}
		if (workspaceToUse == undefined) {
			return {
				root: `${ApplicationDataManager.DATA_FOLDER_NAME}${path.sep}` as const,
				data: ApplicationDataManager.PATH,
				history: ApplicationDataManager.HISTORY_PATH,
				metadata: ApplicationDataManager.METADATA_PATH,
			};
		}
		const root = `${ApplicationDataManager.DATA_FOLDER_NAME}${path.sep}${workspaceToUse}` as const;
		return {
			root,
			data: `${root}${path.sep}${ApplicationDataManager.DATA_FILE_NAME}.json` as const,
			history: `${root}${path.sep}${ApplicationDataManager.DATA_FILE_NAME}_history.json` as const,
			metadata: `${root}${path.sep}${ApplicationDataManager.DATA_FILE_NAME}_metadata.json` as const,
		};
	}

	public getWorkspace() {
		return this.workspace;
	}
}

export const applicationDataManager = ApplicationDataManager.INSTANCE;
