import { DEFAULT_SETTINGS } from '@/constants/defaults';
import { GlobalState } from '@/state/global/slice';
import { GlobalData } from '@/types/data/global';
import { WorkspaceMetadata } from '@/types/data/workspace';
import { mergeDeep } from '@/utils/variables';
import { fileSystemEmitter } from '../file-system/FileSystemEmitter';
import { FileSystemManager } from '../file-system/FileSystemManager';
import { FileSystemWorker } from '../file-system/FileSystemWorker';
import { WorkspaceDataManager } from './WorkspaceDataManager';
import { v4 } from 'uuid';

export const defaultWorkspaceMetadata: WorkspaceMetadata = {
	name: 'Default Workspace',
	description: 'The default workspace in SprocketPan',
	lastModified: new Date().getTime(),
	fileName: 'sprocketpan-default',
	id: 'sprocketpan-default',
};

export class GlobalDataManager {
	public static readonly PATH = 'global.json';

	static async createWorkspace({ fileName, ...workspace }: WorkspaceMetadata) {
		const paths = WorkspaceDataManager.getWorkspacePath(fileName);
		if (workspace.id == null) workspace.id = v4();
		return fileSystemEmitter.createWorkspace(paths, JSON.stringify(workspace));
	}

	static async getWorkspaces() {
		const ret: Record<string, WorkspaceMetadata> = {};
		const list = await FileSystemManager.getWorkspaces();
		list.forEach((workspace) => {
			workspace.id = workspace.id ?? v4();
			ret[workspace.id] = workspace;
		});
		return ret;
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
