// TODO:
// When this is finished, continue copying https://codesandbox.io/s/dnyzyx?file=/components/Navigation.tsx
import { BaseDirectory, createDir, exists, readTextFile, writeFile } from '@tauri-apps/api/fs';
import { log } from '../utils/logging';
import { path } from '@tauri-apps/api';

type ApplicationData = Record<string, unknown>;
class ApplicationDataManager {
	private static readonly DEFAULT_DIRECTORY = BaseDirectory.AppLocalData;
	private static readonly DATA_FOLDER_NAME = 'data' as const;
	private static readonly DATA_FILE_NAME = 'data' as const;
	private static readonly PATH =
		`${ApplicationDataManager.DATA_FOLDER_NAME}${path.sep}${ApplicationDataManager.DATA_FILE_NAME}.json` as const;
	public static readonly INSTANCE = new ApplicationDataManager();

	private data: Promise<ApplicationData>;
	private constructor() {
		this.data = new Promise(async (resolve, _reject) => {
			const defaultData = this.getDefaultData();
			try {
				const folderStatus = await this.createDataFolderIfNotExists();
				const fileStatus = await this.createDataFileIfNotExists(defaultData);
				if (folderStatus === 'alreadyExists' && fileStatus === 'alreadyExists') {
					const data = await this.loadDataFromFile();
					resolve(data);
				} else {
					resolve(defaultData);
				}
			} catch (e) {
				console.error(e);
				resolve(defaultData);
			}
		});
	}

	public getApplicationData(): Promise<ApplicationData> {
		return this.data;
	}

	private getDefaultData(): ApplicationData {
		return {};
	}

	private loadDataFromFile = async () => {
		try {
			const contents = await readTextFile(ApplicationDataManager.PATH, {
				dir: ApplicationDataManager.DEFAULT_DIRECTORY,
			});
			log.trace(`Loaded contents from file:\n${contents}`);
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
}

export const applicationDataManager = ApplicationDataManager.INSTANCE;
