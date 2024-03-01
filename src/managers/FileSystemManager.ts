import { createDir, exists, readDir, readTextFile, writeFile } from '@tauri-apps/api/fs';
import { ApplicationDataManager, applicationDataManager } from './ApplicationDataManager';
import { log } from '../utils/logging';
import { WorkspaceMetadata } from '../types/application-data/application-data';
import { dateTimeReviver } from '../utils/json-parse';
import { EventEmitter } from '@tauri-apps/api/shell';

export type WorkspaceMetadataWithPath = WorkspaceMetadata & { path?: string };

export type FileSystemEvent = 'workspacesChanged';
class FileSystemManager extends EventEmitter<FileSystemEvent> {
	public static INSTANCE = new FileSystemManager();

	private constructor() {
		super();
	}

	async getDirectories(rootFolder: string): Promise<string[]> {
		try {
			const directoryNames = await readDir(rootFolder, { dir: ApplicationDataManager.DEFAULT_DIRECTORY });
			return directoryNames
				.filter((dirent) => dirent.children != undefined)
				.map((dirent) => dirent.name as string) // for type inference
				.filter((x) => x != undefined);
		} catch (e) {
			log.error(e);
			return [];
		}
	}

	async createWorkspace(workspace: WorkspaceMetadata) {
		try {
			const paths = applicationDataManager.getWorkspacePath(workspace.name);
			const doesExist = await exists(paths.metadata, {
				dir: ApplicationDataManager.DEFAULT_DIRECTORY,
			});
			if (doesExist) {
				return;
			}
			await createDir(paths.root, {
				dir: ApplicationDataManager.DEFAULT_DIRECTORY,
				recursive: true,
			});
			// write metadata
			await writeFile(
				{ contents: JSON.stringify(workspace), path: paths.metadata },
				{ dir: ApplicationDataManager.DEFAULT_DIRECTORY },
			);
			this.emit('workspacesChanged');
		} catch (e) {
			log.error(e);
		}
	}

	async getWorkspaces() {
		// undefined represents the default workspace
		const workspaceFolders = [undefined, ...(await this.getDirectories(ApplicationDataManager.DATA_FOLDER_NAME))];
		const workspaceMetadataTasks: Promise<null | WorkspaceMetadataWithPath>[] = [];
		for (const workspaceName of workspaceFolders) {
			const action = async () => {
				const paths = applicationDataManager.getWorkspacePath(workspaceName, true);
				const doesExist = await exists(paths.metadata, {
					dir: ApplicationDataManager.DEFAULT_DIRECTORY,
				});
				if (!doesExist) {
					return null;
				}
				const metadataStr = await readTextFile(paths.metadata, {
					dir: ApplicationDataManager.DEFAULT_DIRECTORY,
				});
				const metadata = JSON.parse(metadataStr, dateTimeReviver) as WorkspaceMetadata;
				return { ...metadata, path: workspaceName };
			};
			workspaceMetadataTasks.push(action());
		}
		const result = await Promise.allSettled(workspaceMetadataTasks);
		const filteredResult = result
			.map((x) => (x.status === 'fulfilled' ? x.value : null))
			.filter((x) => x != null) as WorkspaceMetadataWithPath[];
		return filteredResult;
	}
}

export const fileSystemManager = FileSystemManager.INSTANCE;
