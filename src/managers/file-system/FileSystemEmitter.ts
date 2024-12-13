import { EventEmitter } from '@tauri-apps/api/shell';
import { FileSystemWorker } from './FileSystemWorker';
import { log } from '@/utils/logging';

type WorkspacePaths = { metadata: string; root: string };
export const FILE_SYSTEM_CHANGE_EVENT = 'fsChange';

class FileSystemEmitter extends EventEmitter<typeof FILE_SYSTEM_CHANGE_EVENT> {
	public static INSTANCE = new FileSystemEmitter();

	private constructor() {
		super();
	}

	async createWorkspace(paths: WorkspacePaths, content: string) {
		try {
			if (await FileSystemWorker.exists(paths.metadata)) {
				return;
			}
			await FileSystemWorker.createDir(paths.root);
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

	async upsertFile(path: string, contents: string) {
		const res = FileSystemWorker.upsertFile(path, contents);
		this.emit(FILE_SYSTEM_CHANGE_EVENT);
		return res;
	}
}

export const fileSystemEmitter = FileSystemEmitter.INSTANCE;
