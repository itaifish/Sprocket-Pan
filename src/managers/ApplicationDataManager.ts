// TODO:
// When this is finished, continue copying https://codesandbox.io/s/dnyzyx?file=/components/Navigation.tsx
import { BaseDirectory, createDir, exists, readTextFile, writeFile } from '@tauri-apps/api/fs';
import { log } from '../utils/logging';
import { path } from '@tauri-apps/api';
import {
	ApplicationData,
	Endpoint,
	EndpointRequest,
	EndpointResponse,
	Environment,
	HistoricalEndpointResponse,
	NetworkFetchRequest,
	Service,
} from '../types/application-data/application-data';
import swaggerParseManager from './SwaggerParseManager';
import { EventEmitter } from '@tauri-apps/api/shell';
import { v4 } from 'uuid';
import { TabType } from '../types/state/state';
import { tabsManager } from './TabsManager';
import { noHistoryReplacer } from '../utils/functions';
import { TabsContextType } from './GlobalContextManager';
import { Settings } from '../types/settings/settings';

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
	private static readonly DEFAULT_DIRECTORY = BaseDirectory.AppLocalData;
	public static readonly DATA_FOLDER_NAME = 'data' as const;
	public static readonly DATA_FILE_NAME = 'data' as const;
	private static readonly PATH =
		`${ApplicationDataManager.DATA_FOLDER_NAME}${path.sep}${ApplicationDataManager.DATA_FILE_NAME}.json` as const;
	private static readonly HISTORY_PATH =
		`${ApplicationDataManager.DATA_FOLDER_NAME}${path.sep}${ApplicationDataManager.DATA_FILE_NAME}_history.json` as const;
	public static readonly INSTANCE = new ApplicationDataManager();

	private data: ApplicationData;
	private constructor() {
		super();
		this.data = ApplicationDataManager.getDefaultData();
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
					baseHeaders: {},
					name: 'New Endpoint',
					baseQueryParams: {},
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
					headers: {},
					queryParams: {},
					body: undefined,
					bodyType: 'none',
					rawType: undefined,
					environmentOverride: {},
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
			Object.keys(dataToUpdate).forEach((key) => {
				const envDataToUpdate = dataToUpdate as Environment;
				if (envDataToUpdate[key] === undefined) {
					delete envDataToUpdate[key];
				}
			});
		}
		this.data[`${updateType}s`][updateId] = dataToUpdate;
		this.data = { ...this.data };
		this.emit('update');
	}

	public addResponseToHistory(requestId: string, networkRequest: NetworkFetchRequest, response: EndpointResponse) {
		const reqToUpdate = this.data.requests[requestId];
		if (reqToUpdate == null) {
			log.warn(`Can't find request ${requestId}`);
			return;
		}

		reqToUpdate.history.push({
			request: networkRequest,
			response,
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
		};
	}

	private loadDataFromFile = async () => {
		try {
			const contentsTask = readTextFile(ApplicationDataManager.PATH, {
				dir: ApplicationDataManager.DEFAULT_DIRECTORY,
			});
			const history = await readTextFile(ApplicationDataManager.HISTORY_PATH, {
				dir: ApplicationDataManager.DEFAULT_DIRECTORY,
			});
			const contents = await contentsTask;

			const data = JSON.parse(contents) as ApplicationData;
			const parsedHistory = JSON.parse(history) as { id: string; history: HistoricalEndpointResponse[] }[];
			parsedHistory.forEach((responseHistory) => {
				data.requests[responseHistory.id].history = responseHistory?.history ?? [];
			});
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
		try {
			const doesExist = await exists(`${ApplicationDataManager.DATA_FOLDER_NAME}`, {
				dir: ApplicationDataManager.DEFAULT_DIRECTORY,
			});
			if (!doesExist) {
				log.debug(`Folder does not exist, creating...`);
				await createDir(ApplicationDataManager.DATA_FOLDER_NAME, {
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
	private createDataFileIfNotExists = async (fileContents: Record<string, unknown>) => {
		log.trace(`createDataFolderIfNotExists called`);

		const pathsToCreate = [ApplicationDataManager.PATH, ApplicationDataManager.HISTORY_PATH];
		const createIfNotExistsPromises = pathsToCreate.map((path) => {
			const action = async () => {
				try {
					const doesExist = await exists(path, {
						dir: ApplicationDataManager.DEFAULT_DIRECTORY,
					});
					if (!doesExist) {
						log.debug(`File does not exist, creating...`);
						await writeFile(
							{ contents: JSON.stringify(fileContents), path },
							{ dir: ApplicationDataManager.DEFAULT_DIRECTORY },
						);
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
		try {
			const saveData = async () => {
				const doesExist = await exists(ApplicationDataManager.PATH, { dir: ApplicationDataManager.DEFAULT_DIRECTORY });
				if (!doesExist) {
					log.warn(`File does not exist, exiting...`);
					return 'doesNotExist' as const;
				} else {
					log.trace(`File already exists, updating...`);
					await writeFile(
						{ contents: JSON.stringify(applicationData, noHistoryReplacer, 4), path: ApplicationDataManager.PATH },
						{ dir: ApplicationDataManager.DEFAULT_DIRECTORY },
					);
					this.emit('saved');
					return 'saved' as const;
				}
			};
			const saveHistory = async () => {
				const doesExist = await exists(ApplicationDataManager.HISTORY_PATH, {
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
							path: ApplicationDataManager.HISTORY_PATH,
						},
						{ dir: ApplicationDataManager.DEFAULT_DIRECTORY },
					);
					this.emit('saved');
					return 'saved' as const;
				}
			};

			const results = await Promise.all([saveData(), saveHistory()]);
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
			const fileStatus = await this.createDataFileIfNotExists(defaultData);
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
}

export const applicationDataManager = ApplicationDataManager.INSTANCE;
