import { readDir } from '@tauri-apps/api/fs';
import { ApplicationDataManager } from './ApplicationDataManager';
import { log } from '../utils/logging';

class FileSystemManager {
	public static INSTANCE = new FileSystemManager();

	private constructor() {}

	async getDirectories(rootFolder: string): Promise<string[]> {
		log.info(`getting directoryData:`);
		try {
			const directoryData = await readDir(rootFolder, { dir: ApplicationDataManager.DEFAULT_DIRECTORY });
			log.info(`got directoryData: ${directoryData.length}`);
			return directoryData
				.filter((dirent) => dirent.children != undefined)
				.map((dirent) => dirent.name as string) // for type inference
				.filter((x) => x != undefined);
		} catch (e) {
			log.error(e);
			return [];
		}
	}
}

export const fileSystemManager = FileSystemManager.INSTANCE;
