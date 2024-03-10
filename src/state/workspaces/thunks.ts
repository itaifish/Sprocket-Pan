import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { fileSystemManager } from '../../managers/FileSystemManager';
import { WorkspaceMetadata } from '../../types/application-data/application-data';

export const deleteWorkspace = createAsyncThunk<void, WorkspaceMetadata, { state: RootState }>(
	'workspaces/delete',
	async (workspace, thunk) => {
		const path = workspace.fileName;
		const state = thunk.getState().workspaces;
		if (path == null) {
			throw new Error('cannot delete a workspace without a path');
		}
		await fileSystemManager.deleteWorkspace(path);
		if (path === state.selected?.fileName) {
			state.selected = undefined;
		}
	},
);

export const createWorkspace = createAsyncThunk<void, WorkspaceMetadata, { state: RootState }>(
	'workspaces/create',
	async (workspace) => {
		await fileSystemManager.createWorkspace(workspace);
	},
);
