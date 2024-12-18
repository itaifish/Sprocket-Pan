import { log } from '@/utils/logging';
import { BaseDirectory, createDir, exists, readDir, readTextFile, removeDir, writeFile } from '@tauri-apps/api/fs';

export class FileSystemWorker {
	public static readonly DEFAULT_DIRECTORY = BaseDirectory.AppLocalData;
	public static readonly DATA_FOLDER_NAME = 'data' as const;
	public static readonly DATA_FILE_NAME = 'data' as const;

	public static exists(path: string) {
		return exists(path, { dir: this.DEFAULT_DIRECTORY });
	}

	public static writeFile(path: string, contents: string) {
		return writeFile({ contents, path }, { dir: this.DEFAULT_DIRECTORY });
	}

	public static async upsertFile(path: string, contents: string) {
		const doesExist = await this.exists(path);
		if (doesExist) {
			log.trace(`${path} already exists, no need to create.`);
			return this.writeFile(path, contents);
		} else {
			log.debug(`${path} does not exist, creating...`);
			return this.writeFile(path, contents);
		}
	}

	/**
	 * @returns true if the file was updated and written to, false if not
	 */
	public static async tryUpdateFile(path: string, contents: string) {
		if (await this.exists(path)) {
			log.trace(`${path} already exists, updating...`);
			await this.writeFile(path, contents);
			return true;
		} else {
			log.warn(`${path} does not exist, returning.`);
			return false;
		}
	}

	public static async readTextFile(path: string) {
		return readTextFile(path, { dir: this.DEFAULT_DIRECTORY });
	}

	public static async createDir(path: string) {
		return createDir(path, {
			dir: this.DEFAULT_DIRECTORY,
			recursive: true,
		});
	}

	public static async removeDir(path: string) {
		return removeDir(path, {
			dir: this.DEFAULT_DIRECTORY,
			recursive: true,
		});
	}

	public static async readDir(path: string) {
		return readDir(path, { dir: this.DEFAULT_DIRECTORY });
	}
}
