import { WorkspaceMetadata } from '@/types/data/workspace';
import { log } from '@/utils/logging';
import { WorkspaceDataManager } from '../data/WorkspaceDataManager';
import { FileSystemWorker } from './FileSystemWorker';

type WorkspacePaths = { metadata: string; root: string };

export class FileSystemManager {
	static async createWorkspace(paths: WorkspacePaths, content: Omit<WorkspaceMetadata, 'fileName'>) {
		if (await FileSystemWorker.exists(paths.metadata)) {
			return;
		}
		await FileSystemWorker.createDir(paths.root);
		await FileSystemWorker.writeFile({ path: paths.metadata, content: JSON.stringify(content) });
	}

	static async updateWorkspace(paths: WorkspacePaths, content: Omit<WorkspaceMetadata, 'fileName'>) {
		return FileSystemWorker.upsertFile({ path: paths.metadata, content: JSON.stringify(content) });
	}

	static async deleteWorkspace(paths: WorkspacePaths) {
		const doesExist = await FileSystemWorker.exists(paths.metadata);
		if (!doesExist) {
			return null;
		}
		await FileSystemWorker.removeDir(paths.root);
	}
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
			await FileSystemWorker.writeFile({ path, content: JSON.stringify(content) });
			return true;
		}
	}

	static async getDirectories(): Promise<string[]> {
		const directoryNames = await FileSystemWorker.readDir(FileSystemWorker.DATA_FOLDER_NAME);
		return directoryNames
			.filter((dirent) => dirent.children != undefined)
			.map((dirent) => dirent.name as string) // for type inference
			.filter((x) => x != undefined);
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
