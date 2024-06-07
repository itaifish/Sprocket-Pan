import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { fileSystemManager } from '../../managers/FileSystemManager';
import { WorkspaceMetadata } from '../../types/application-data/application-data';
import { setSelectedWorkspace } from './slice';
import { applicationDataManager } from '../../managers/ApplicationDataManager';
import { setFullState } from '../active/slice';
import { log } from '../../utils/logging';

const root = 'workspaces';

export const deleteWorkspace = createAsyncThunk<void, WorkspaceMetadata, { state: RootState }>(
	`${root}/delete`,
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
	`${root}/create`,
	async (workspace) => {
		await fileSystemManager.createWorkspace(workspace);
	},
);

export const loadAndSelectWorkspace = createAsyncThunk<void, WorkspaceMetadata, { state: RootState }>(
	`${root}/select`,
	async (workspace, thunk) => {
		const data = await applicationDataManager.initializeWorkspace(workspace);
		if (data) {
			await Promise.all([
				thunk.dispatch(setSelectedWorkspace(data.workspaceMetadata)),
				thunk.dispatch(setFullState(data)),
			]);
			log.info('Saving workspace metadata: ' + JSON.stringify(thunk.getState().active.workspaceMetadata));
		} else {
			log.warn('Workspace failed to load');
		}
	},
);
