import { WorkspaceDataManager } from './WorkspaceDataManager';
import { GlobalData, WorkspaceMetadata } from '../../types/application-data/application-data';
import { FileSystemManager } from '../file-system/FileSystemManager';
import { FileSystemWorker } from '../file-system/FileSystemWorker';
import { mergeDeep } from '../../utils/variables';
import { DEFAULT_SETTINGS } from '../../constants/defaults';
import { GlobalState } from '../../state/global/slice';
import { fileSystemEmitter } from '../file-system/FileSystemEmitter';

export const defaultWorkspaceMetadata: WorkspaceMetadata = {
	name: 'Default Workspace',
	description: 'The default workspace in SprocketPan',
	lastModified: new Date().getTime(),
	fileName: 'sprocketpan-default',
};

export class GlobalDataManager {
	public static readonly PATH = 'global.json';

	static async createWorkspace({ fileName, ...workspace }: WorkspaceMetadata) {
		const paths = WorkspaceDataManager.getWorkspacePath(fileName);
		return fileSystemEmitter.createWorkspace(paths, JSON.stringify(workspace));
	}

	static async getWorkspaces() {
		return FileSystemManager.getWorkspaces();
	}

	static deleteWorkspace(name: string) {
		const paths = WorkspaceDataManager.getWorkspacePath(name);
		return fileSystemEmitter.deleteWorkspace(paths);
	}

	static async getGlobalData(): Promise<GlobalData> {
		if (await FileSystemWorker.exists(GlobalDataManager.PATH)) {
			const globalData = JSON.parse(await FileSystemWorker.readTextFile(GlobalDataManager.PATH)) as GlobalData;
			// settings gains new properties often, so as an exception to our normal update logic,
			// we merge settings with the Default to populate new fields
			globalData.settings = mergeDeep(DEFAULT_SETTINGS, globalData.settings);
			return globalData;
		}
		return { uiMetadata: { idSpecific: {} }, lastSaved: new Date().getTime(), settings: DEFAULT_SETTINGS };
	}

	static async saveGlobalData({ activeWorkspace, workspaces, ...state }: GlobalState) {
		return fileSystemEmitter.upsertFile(GlobalDataManager.PATH, JSON.stringify(state));
	}
}
