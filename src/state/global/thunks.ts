import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { uiActions } from '../ui/slice';
import { globalActions } from './slice';
import { activeActions } from '../active/slice';
import { WorkspaceMetadata } from '@/types/data/workspace';
import { WorkspaceDataManager } from '@/managers/data/WorkspaceDataManager';
import { filterOldHistoryEntries, getSettingsFromState } from '@/utils/application';

export const globalThunkName = 't/global';

export const loadAndSelectWorkspace = createAsyncThunk<void, WorkspaceMetadata, { state: RootState }>(
	`${globalThunkName}/select`,
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
