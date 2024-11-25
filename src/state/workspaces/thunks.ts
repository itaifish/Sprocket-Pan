import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { WorkspaceMetadata } from '../../types/application-data/application-data';
import { setSelectedWorkspace } from './slice';
import { WorkspaceDataManager } from '../../managers/data/WorkspaceDataManager';
import { setFullState } from '../active/slice';
import { log } from '../../utils/logging';
import { clearTabs, setSearchText } from '../tabs/slice';
import { GlobalDataManager } from '../../managers/data/GlobalDataManager';

const root = 'workspaces';

export const deleteWorkspace = createAsyncThunk<void, WorkspaceMetadata, { state: RootState }>(
	`${root}/delete`,
	async (workspace, thunk) => {
		const path = workspace.fileName;
		const state = thunk.getState().workspaces;
		if (path == null) {
			throw new Error('cannot delete a workspace without a path');
		}
		await GlobalDataManager.deleteWorkspace(path);
		if (path === state.selected?.fileName) {
			state.selected = undefined;
		}
	},
);

export const createWorkspace = createAsyncThunk<void, WorkspaceMetadata, { state: RootState }>(
	`${root}/create`,
	async (workspace) => {
		await GlobalDataManager.createWorkspace(workspace);
	},
);

export const loadAndSelectWorkspace = createAsyncThunk<void, WorkspaceMetadata, { state: RootState }>(
	`${root}/select`,
	async (workspace, thunk) => {
		const data = await WorkspaceDataManager.initializeWorkspace(workspace);
		if (data) {
			await Promise.all([
				thunk.dispatch(clearTabs()),
				thunk.dispatch(setSearchText('')),
				thunk.dispatch(setSelectedWorkspace(data.metadata)),
				thunk.dispatch(setFullState(data)),
			]);
		} else {
			log.warn('Workspace failed to load');
		}
	},
);
