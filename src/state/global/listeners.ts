import { createListenerMiddleware, ThunkDispatch, UnknownAction } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { activeActions } from '../active/slice';
import { uiActions } from '../ui/slice';
import { WorkspaceDataManager } from '@/managers/data/WorkspaceDataManager';
import { getSettingsFromState, filterOldHistoryEntries } from '@/utils/application';

const workspaceSelectionListener = createListenerMiddleware<
	RootState,
	ThunkDispatch<RootState, undefined, UnknownAction>
>();

workspaceSelectionListener.startListening({
	predicate: (_, currentState, previousState) => {
		return currentState.global.activeWorkspace !== previousState.global.activeWorkspace;
	},
	effect: async (_, { dispatch, getState }) => {
		const global = getState().global;
		dispatch(activeActions.reset());
		dispatch(uiActions.reset());
		if (global.activeWorkspace != null) {
			dispatch(uiActions.setLoading(true));
			const data = await WorkspaceDataManager.initializeWorkspace(global.workspaces[global.activeWorkspace]);
			const settings = getSettingsFromState({ global, active: data });
			// TODO: I'd love to move this filtering somewhere more obvious or at least adjacent to other parsing.
			data.history = filterOldHistoryEntries(data.history, settings.history.maxDays);
			dispatch(activeActions.setFullState(data));
			const orphans = await WorkspaceDataManager.processOrphans(data, global.workspaces[global.activeWorkspace]);
			if (orphans.endpoints.length > 0 || orphans.requests.length > 0) {
				dispatch(uiActions.setOrphans(orphans));
			}
			dispatch(uiActions.setLoading(false));
		}
	},
});

export { workspaceSelectionListener };
