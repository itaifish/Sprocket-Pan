import { log } from '@/utils/logging';
import { BaseDirectory, createDir, exists, readDir, readTextFile, removeDir } from '@tauri-apps/api/fs';
import { InvokerFileUpdate, RustInvoker } from '../RustInvoker';

export class FileSystemWorker {
	public static readonly DEFAULT_DIRECTORY = BaseDirectory.AppLocalData;
	public static readonly DATA_FOLDER_NAME = 'data' as const;
	public static readonly DATA_FILE_NAME = 'data' as const;

	public static exists(path: string) {
		return exists(path, { dir: this.DEFAULT_DIRECTORY });
	}

	public static writeFiles(files: InvokerFileUpdate[]) {
		return RustInvoker.saveFiles(files);
	}

	public static writeFile(file: InvokerFileUpdate) {
		return this.writeFiles([file]);
	}

	public static async upsertFile(file: InvokerFileUpdate) {
		const doesExist = await this.exists(file.path);
		if (doesExist) {
			log.trace(`${file.path} already exists, no need to create.`);
			return this.writeFile(file);
		} else {
			log.debug(`${file.path} does not exist, creating...`);
			return this.writeFile(file);
		}
	}

	/**
	 * @returns true if the file was updated and written to, false if not
	 */
	public static async tryUpdateFile(file: InvokerFileUpdate) {
		if (await this.exists(file.path)) {
			log.trace(`${file.path} already exists, updating...`);
			await this.writeFile(file);
			return true;
		} else {
			log.warn(`${file.path} does not exist, returning.`);
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
