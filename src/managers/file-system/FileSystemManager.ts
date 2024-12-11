import { WorkspaceDataManager } from './../data/WorkspaceDataManager';
import { log } from '../../utils/logging';
import { WorkspaceMetadata } from '../../types/application-data/application-data';
import { FileSystemWorker } from './FileSystemWorker';

export class FileSystemManager {
	/**
	 * This function creates a data folder if it does not already exist.
	 * @returns true if it created a folder, false if not
	 */
	static async createDataFolderIfNotExists() {
		log.trace(`createDataFolderIfNotExists called`);
		const dataFolderLocalPath = FileSystemWorker.DATA_FOLDER_NAME;
		const doesExist = await FileSystemWorker.exists(dataFolderLocalPath);
		if (doesExist) {
			log.trace(`Folder already exists, no need to create`);
			return false;
		} else {
			log.debug(`Folder does not exist, creating...`);
			await FileSystemWorker.createDir(dataFolderLocalPath);
			return true;
		}
	}

	/**
	 * This function creates a data file if it does not already exist.
	 * @returns true if it created a file, false if not
	 */
	static async createFileIfNotExists(path: string, content: unknown) {
		log.trace('createFileIfNotExists called');
		const doesExist = await FileSystemWorker.exists(path);
		if (doesExist) {
			log.trace(`File already exists, no need to create`);
			return false;
		} else {
			log.debug(`File does not exist, creating...`);
			await FileSystemWorker.writeFile(path, JSON.stringify(content));
			return true;
		}
	}

	static async getDirectories(): Promise<string[]> {
		try {
			const directoryNames = await FileSystemWorker.readDir(FileSystemWorker.DATA_FOLDER_NAME);
			return directoryNames
				.filter((dirent) => dirent.children != undefined)
				.map((dirent) => dirent.name as string) // for type inference
				.filter((x) => x != undefined);
		} catch (e) {
			log.error(e);
			return [];
		}
	}

	static async getWorkspaces() {
		const workspaceFolders = await this.getDirectories();
		const metadataTasks: Promise<null | WorkspaceMetadata>[] = [];
		for (const workspaceFolder of workspaceFolders) {
			const action = async () => {
				const paths = WorkspaceDataManager.getWorkspacePath(workspaceFolder);
				const doesExist = await FileSystemWorker.exists(paths.metadata);
				if (!doesExist) {
					return null;
				}
				const metadataStr = await FileSystemWorker.readTextFile(paths.metadata);
				const metadata = JSON.parse(metadataStr) as WorkspaceMetadata;
				return { ...metadata, fileName: workspaceFolder };
			};
			metadataTasks.push(action());
		}
		const result = await Promise.allSettled(metadataTasks);
		const filteredResult = result
			.map((x) => (x.status === 'fulfilled' ? x.value : null))
			.filter((x) => x != null) as WorkspaceMetadata[];
		return filteredResult;
	}
}
