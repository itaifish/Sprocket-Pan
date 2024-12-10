import { WorkspaceDataManager } from './WorkspaceDataManager';
import { WorkspaceMetadata } from '../../types/application-data/application-data';
import { fileSystemManager } from '../file-system/FileSystemManager';

export const defaultWorkspaceMetadata: WorkspaceMetadata = {
	name: 'Default Workspace',
	description: 'The default workspace in SprocketPan',
	lastModified: new Date().getTime(),
	fileName: 'sprocketpan-default',
};

export class GlobalDataManager {
	static async createWorkspace({ fileName, ...workspace }: WorkspaceMetadata) {
		const paths = WorkspaceDataManager.getWorkspacePath(fileName);
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
