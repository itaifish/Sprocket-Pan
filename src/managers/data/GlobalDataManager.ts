import { DEFAULT_SETTINGS } from '@/constants/defaults';
import { GlobalState } from '@/state/global/slice';
import { GlobalData } from '@/types/data/global';
import { WorkspaceMetadata } from '@/types/data/workspace';
import { mergeDeep } from '@/utils/variables';
import { FileSystemManager } from '../file-system/FileSystemManager';
import { FileSystemWorker } from '../file-system/FileSystemWorker';
import { WorkspaceDataManager } from './WorkspaceDataManager';
import { SaveUpdateManager } from '../SaveUpdateManager';

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
		return FileSystemManager.createWorkspace(paths, workspace);
	}

	static async updateWorkspace(workspace: WorkspaceMetadata) {
		const paths = WorkspaceDataManager.getWorkspacePath(workspace.fileName);
		return FileSystemManager.updateWorkspace(paths, workspace);
	}

	static async getWorkspaces() {
		const ret: Record<string, WorkspaceMetadata> = {};
		const { list, updated } = SaveUpdateManager.updateWorkspaces(await FileSystemManager.getWorkspaces());
		list.forEach((workspace) => {
			ret[workspace.id] = workspace;
		});
		updated.forEach((id) => {
			this.updateWorkspace(ret[id]);
		});
		return ret;
	}

	static deleteWorkspace(name: string) {
		const paths = WorkspaceDataManager.getWorkspacePath(name);
		return FileSystemManager.deleteWorkspace(paths);
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
		return FileSystemWorker.upsertFile({ path: GlobalDataManager.PATH, content: JSON.stringify(state) });
	}
}
