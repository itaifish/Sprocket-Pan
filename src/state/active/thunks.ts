import { WorkspaceDataManager } from '@/managers/data/WorkspaceDataManager';
import { getAncestors, getDescendents } from '@/utils/getters';
import { uiActions } from '@/state/ui/slice';
import { errorToSprocketError } from '@/utils/conversion';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '@/state/store';
import { activeActions, activeThunkName, UpdateLinkedEnv } from './slice';

interface RelinkEnvironmentsArgs extends Omit<UpdateLinkedEnv, 'envId'> {
	remove: string[];
	add: string[];
}

export const relinkEnvironments = createAsyncThunk<void, RelinkEnvironmentsArgs, { state: RootState }>(
	`${activeThunkName}/relinkEnvironments`,
	async ({ remove, add, serviceEnvId, serviceId }, thunk) => {
		remove.forEach((envId) => thunk.dispatch(activeActions.removeLinkedEnv({ envId, serviceId })));
		add.forEach((envId) => thunk.dispatch(activeActions.addLinkedEnv({ envId, serviceEnvId, serviceId })));
	},
);

export const saveActiveData = createAsyncThunk<void, void, { state: RootState }>(
	`${activeThunkName}/saveData`,
	async (_, thunk) => {
		const { active, ui } = thunk.getState();
		const { lastModified, lastSaved, ...data } = active;
		if (lastModified < lastSaved || ui.orphans != null) return;
		try {
			await WorkspaceDataManager.saveData(data);
			thunk.dispatch(activeActions.setSavedNow());
		} catch (err) {
			thunk.dispatch(
				uiActions.toast({
					message: `Failed to save all files! Error: ${errorToSprocketError(err).message}`,
					color: 'danger',
				}),
			);
		}
	},
);

export const toggleSync = createAsyncThunk<void, string, { state: RootState }>(
	`${activeThunkName}/toggleSync`,
	(id, thunk) => {
		const state = thunk.getState().active;
		if (state.syncMetadata.items[id]) {
			[id, ...getDescendents(state, id)].forEach((itemId) => {
				thunk.dispatch(activeActions.setSyncItem({ id: itemId, value: false }));
			});
		} else {
			[id, ...getAncestors(state, id)].forEach((itemId) => {
				thunk.dispatch(activeActions.setSyncItem({ id: itemId, value: true }));
			});
		}
	},
);
