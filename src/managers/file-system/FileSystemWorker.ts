import { BaseDirectory, createDir, exists, readDir, readTextFile, removeDir, writeFile } from '@tauri-apps/api/fs';
import { log } from '../../utils/logging';

export class FileSystemWorker {
	public static readonly DEFAULT_DIRECTORY = BaseDirectory.AppLocalData;
	public static readonly DATA_FOLDER_NAME = 'data' as const;
	public static readonly DATA_FILE_NAME = 'data' as const;

	public static exists(path: string) {
		return exists(path, { dir: FileSystemWorker.DEFAULT_DIRECTORY });
	}

	public static writeFile(path: string, contents: string) {
		return writeFile({ contents, path }, { dir: FileSystemWorker.DEFAULT_DIRECTORY });
	}

	public static async upsertFile(path: string, contents: string) {
		const doesExist = await FileSystemWorker.exists(path);
		if (doesExist) {
			log.trace(`${path} already exists, no need to create.`);
			return FileSystemWorker.writeFile(path, contents);
		} else {
			log.debug(`${path} does not exist, creating...`);
			return FileSystemWorker.writeFile(path, contents);
		}
	}

	/**
	 * @returns true if the file was updated and written to, false if not
	 */
	public static async tryUpdateFile(path: string, contents: string) {
		if (await this.exists(path)) {
			log.trace('File already exists, updating...');
			await this.writeFile(path, contents);
			return true;
		} else {
			log.warn('File does not exist...');
			return false;
		}
	}

	public static async readTextFile(path: string) {
		return readTextFile(path, { dir: FileSystemWorker.DEFAULT_DIRECTORY });
	}

	public static async createDir(path: string) {
		return createDir(path, {
			dir: FileSystemWorker.DEFAULT_DIRECTORY,
			recursive: true,
		});
	}

	public static async removeDir(path: string) {
		return removeDir(path, {
			dir: FileSystemWorker.DEFAULT_DIRECTORY,
			recursive: true,
		});
	}

	public static async readDir(path: string) {
		return readDir(path, { dir: FileSystemWorker.DEFAULT_DIRECTORY });
	}
}
