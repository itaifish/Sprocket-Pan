import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { WorkspaceMetadata } from '../../types/application-data/application-data';
import { WorkspaceDataManager } from '../../managers/data/WorkspaceDataManager';
import { activeActions } from '../active/slice';
import { log } from '../../utils/logging';
import { GlobalDataManager } from '../../managers/data/GlobalDataManager';
import { tabsActions } from '../tabs/slice';
import { globalActions } from './slice';

const root = 'global';

export const deleteWorkspace = createAsyncThunk<void, WorkspaceMetadata, { state: RootState }>(
	`${root}/delete`,
	async (workspace, thunk) => {
		const path = workspace.fileName;
		const state = thunk.getState().global;
		if (path == null) {
			throw new Error('cannot delete a workspace without a path');
		}
		await GlobalDataManager.deleteWorkspace(path);
		if (path === state.activeWorkspace?.fileName) {
			state.activeWorkspace = undefined;
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
				thunk.dispatch(tabsActions.clearTabs()),
				thunk.dispatch(tabsActions.setSearchText('')),
				thunk.dispatch(globalActions.setSelectedWorkspace(data.metadata)),
				thunk.dispatch(activeActions.setFullState(data)),
			]);
		} else {
			log.warn('Workspace failed to load!');
		}
	},
);
