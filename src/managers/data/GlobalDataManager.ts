import { WorkspaceDataManager } from './WorkspaceDataManager';
import { WorkspaceMetadata } from '../../types/application-data/application-data';
import { fileSystemManager } from '../file-system/FileSystemManager';

export class GlobalDataManager {
	static async createWorkspace(workspace: WorkspaceMetadata) {
		const paths = WorkspaceDataManager.getWorkspacePath(workspace.fileName);
		return fileSystemManager.createWorkspace(paths, JSON.stringify(workspace));
	}

	static async getWorkspaces() {
		return fileSystemManager.getWorkspaces();
	}

	static deleteWorkspace(name: string) {
		const paths = WorkspaceDataManager.getWorkspacePath(name);
		return fileSystemManager.deleteWorkspace(paths);
	}
}
