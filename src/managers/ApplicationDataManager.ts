// TODO:
// When this is finished, continue copying https://codesandbox.io/s/dnyzyx?file=/components/Navigation.tsx
import { BaseDirectory, createDir, exists, readTextFile, writeFile } from '@tauri-apps/api/fs';
import { log } from '../utils/logging';

type ApplicationData = Record<string, unknown>;
export default class ApplicationDataManager {
	public instance = new ApplicationDataManager();
	private static readonly DEFAULT_DIRECTORY = BaseDirectory.AppData;
	private static readonly DATA_FOLDER_NAME = 'data' as const;
	private static readonly DATA_FILE_NAME = 'data' as const;
	private static readonly PATH =
		`./${ApplicationDataManager.DATA_FOLDER_NAME}/${ApplicationDataManager.DATA_FILE_NAME}.json` as const;
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

	private getDefaultData(): ApplicationData {
		return {};
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
		try {
			if (!exists(ApplicationDataManager.DATA_FOLDER_NAME, { dir: ApplicationDataManager.DEFAULT_DIRECTORY })) {
				await createDir(ApplicationDataManager.DATA_FOLDER_NAME, {
					dir: ApplicationDataManager.DEFAULT_DIRECTORY,
					recursive: true,
				});
				return 'created' as const;
			} else {
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
		try {
			if (!exists(ApplicationDataManager.PATH, { dir: ApplicationDataManager.DEFAULT_DIRECTORY })) {
				await writeFile(
					{ contents: JSON.stringify(fileContents), path: ApplicationDataManager.PATH },
					{ dir: ApplicationDataManager.DEFAULT_DIRECTORY },
				);
				return 'created' as const;
			} else {
				return 'alreadyExists' as const;
			}
		} catch (e) {
			console.log(e);
			return 'error' as const;
		}
	};
}
