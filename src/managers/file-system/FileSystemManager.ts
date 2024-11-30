import { WorkspaceDataManager } from './../data/WorkspaceDataManager';
import { log } from '../../utils/logging';
import { WorkspaceMetadata } from '../../types/application-data/application-data';
import { EventEmitter } from '@tauri-apps/api/shell';
import { FileSystemWorker } from './FileSystemWorker';

type WorkspacePaths = { metadata: string; root: string };
export const FILE_SYSTEM_CHANGE_EVENT = 'fsChange';

class FileSystemManager extends EventEmitter<typeof FILE_SYSTEM_CHANGE_EVENT> {
	public static INSTANCE = new FileSystemManager();

	private constructor() {
		super();
	}

	/**
	 * This function creates a data folder if it does not already exist.
	 * @returns true if it created a folder, false if not
	 */
	async createDataFolderIfNotExists() {
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
	async createFileIfNotExists(path: string, content: unknown) {
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

	async getDirectories(): Promise<string[]> {
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

	async getWorkspaces() {
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

	async createWorkspace(paths: WorkspacePaths, content: string) {
		try {
			const doesExist = await FileSystemWorker.exists(paths.metadata);
			if (!doesExist) {
				return;
			}
			await FileSystemWorker.createDir(paths.root);
			// write metadata
			await FileSystemWorker.writeFile(paths.metadata, content);
			this.emit(FILE_SYSTEM_CHANGE_EVENT);
		} catch (e) {
			log.error(e);
		}
	}

	async deleteWorkspace(paths: WorkspacePaths) {
		const doesExist = await FileSystemWorker.exists(paths.metadata);
		if (!doesExist) {
			return null;
		}
		await FileSystemWorker.removeDir(paths.root);
		this.emit(FILE_SYSTEM_CHANGE_EVENT);
	}
}

export const fileSystemManager = FileSystemManager.INSTANCE;
