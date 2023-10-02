// TODO:
// When this is finished, continue copying https://codesandbox.io/s/dnyzyx?file=/components/Navigation.tsx
import { BaseDirectory, createDir, exists, readTextFile, writeFile } from '@tauri-apps/api/fs';
import { log } from '../utils/logging';
import { path } from '@tauri-apps/api';
import { ApplicationData, Endpoint, EndpointRequest } from '../types/application-data/application-data';
import swaggerParseManager from './SwaggerParseManager';
import { EventEmitter } from '@tauri-apps/api/shell';
import { v4 } from 'uuid';

type DataEvent = 'update';

export class ApplicationDataManager extends EventEmitter<DataEvent> {
	private static readonly DEFAULT_DIRECTORY = BaseDirectory.AppLocalData;
	private static readonly DATA_FOLDER_NAME = 'data' as const;
	private static readonly DATA_FILE_NAME = 'data' as const;
	private static readonly PATH =
		`${ApplicationDataManager.DATA_FOLDER_NAME}${path.sep}${ApplicationDataManager.DATA_FILE_NAME}.json` as const;
	public static readonly INSTANCE = new ApplicationDataManager();

	private data: ApplicationData;
	private constructor() {
		super();
		this.data = this.getDefaultData();
		this.init();
	}

	public createDefaultRequest(endpointId: string) {
		const endPointToUpdate = this.data.endpoints[endpointId];
		if (endPointToUpdate == null) {
			log.warn(`Can't find endpoint ${endpointId}`);
			return;
		}
		const keys = Object.keys(this.data.requests);
		let requestStr = `New Request`;
		let index = 0;
		while (keys.includes(`${requestStr}(${index})`)) {
			index++;
		}
		requestStr += `(${index})`;

		const newEndpointRequest: EndpointRequest<'none'> = {
			id: v4(),
			endpointId: endPointToUpdate.id,
			name: requestStr,
			headers: {},
			queryParams: {},
			bodyType: 'none',
			rawType: undefined,
			body: undefined,
		};
		this.data.requests[newEndpointRequest.id] = newEndpointRequest;
		this.data = { ...this.data };
		this.emit('update');
	}

	public updateEndpoint(endpointId: string, endpointUpdate: Partial<Endpoint>) {
		let endPointToUpdate = this.data.endpoints[endpointId];
		if (endPointToUpdate == null) {
			log.warn(`Can't find endpoint ${endpointId}`);
			return;
		}
		log.info(`Endpoint to update before: ${JSON.stringify(endPointToUpdate)}`);
		endPointToUpdate = { ...endPointToUpdate, ...endpointUpdate };
		log.info(`endpoint object is now: ${JSON.stringify(this.data.endpoints[endpointId])}`);
		// Kinda hacky, need to tell react to update.
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

	private getDefaultData(): ApplicationData {
		return {
			services: {},
			endpoints: {},
			requests: {},
			settings: {
				debugLogs: true,
			},
		};
	}

	private loadDataFromFile = async () => {
		try {
			const contents = await readTextFile(ApplicationDataManager.PATH, {
				dir: ApplicationDataManager.DEFAULT_DIRECTORY,
			});
			return JSON.parse(contents);
		} catch (e) {
			console.error(e);
			return this.getDefaultData();
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
		try {
			const doesExist = await exists(ApplicationDataManager.PATH, { dir: ApplicationDataManager.DEFAULT_DIRECTORY });
			if (!doesExist) {
				log.debug(`File does not exist, creating...`);
				await writeFile(
					{ contents: JSON.stringify(fileContents), path: ApplicationDataManager.PATH },
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

	private saveApplicationData = async (applicationData: ApplicationData) => {
		try {
			const doesExist = await exists(ApplicationDataManager.PATH, { dir: ApplicationDataManager.DEFAULT_DIRECTORY });
			if (!doesExist) {
				log.warn(`File does not exist, exiting...`);
				return 'doesNotExist' as const;
			} else {
				log.trace(`File already exists, updating...`);
				await writeFile(
					{ contents: JSON.stringify(applicationData), path: ApplicationDataManager.PATH },
					{ dir: ApplicationDataManager.DEFAULT_DIRECTORY },
				);
				return 'saved' as const;
			}
		} catch (e) {
			log.error(e);
			return 'error' as const;
		}
	};

	private async init() {
		const defaultData = this.getDefaultData();
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
