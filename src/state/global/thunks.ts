import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { uiActions } from '../ui/slice';
import { globalActions } from './slice';
import { activeActions } from '../active/slice';
import { WorkspaceMetadata } from '@/types/data/workspace';
import { GlobalDataManager } from '@/managers/data/GlobalDataManager';
import { WorkspaceDataManager } from '@/managers/data/WorkspaceDataManager';
import { filterOldHistoryEntries, getSettingsFromState } from '@/utils/application';

const root = 'global';

export const deleteWorkspace = createAsyncThunk<void, string, { state: RootState }>(
	`${root}/delete`,
	async (id, thunk) => {
		const state = thunk.getState().global;
		const path = state.workspaces[id]?.fileName;
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
		const { global } = thunk.getState();
		const data = await WorkspaceDataManager.initializeWorkspace(workspace);
		const settings = getSettingsFromState({ global, active: data });
		thunk.dispatch(uiActions.clearTabs());
		thunk.dispatch(uiActions.setSearchText(''));
		thunk.dispatch(globalActions.setSelectedWorkspace(data.metadata));
		data.history = filterOldHistoryEntries(data.history, settings.history.maxDays);
		thunk.dispatch(activeActions.setFullState(data));
		const orphans = await WorkspaceDataManager.processOrphans(data);
		if (orphans.endpoints.length > 0 || orphans.requests.length > 0) {
			thunk.dispatch(uiActions.setOrphans(orphans));
		}
	},
);
