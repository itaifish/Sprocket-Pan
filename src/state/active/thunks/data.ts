import { WorkspaceDataManager } from '@/managers/data/WorkspaceDataManager';
import { ParsedServiceWorkspaceData } from '@/managers/parsers/SwaggerParseManager';
import { RootState } from '@/state/store';
import { Environment, Script } from '@/types/data/workspace';
import { log } from '@/utils/logging';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { activeThunkName, activeActions } from '../slice';
import { getAncestors, getDescendents } from '@/utils/getters';
import { uiActions } from '@/state/ui/slice';
import { errorToSprocketError } from '@/utils/conversion';

type ParsedWorkspaceData = ParsedServiceWorkspaceData & { environments?: Environment[]; scripts?: Script[] };

export const injectLoadedData = createAsyncThunk<void, ParsedWorkspaceData, { state: RootState }>(
	`${activeThunkName}/injectData`,
	(loadedData, thunk) => {
		for (const service of loadedData.services) {
			thunk.dispatch(activeActions.insertService(service));
			log.info(`Inserting ${service.name} [${service.id}]`);
		}
		for (const endpoint of loadedData.endpoints) {
			thunk.dispatch(activeActions.insertEndpoint(endpoint));
		}
		for (const request of loadedData.requests) {
			thunk.dispatch(activeActions.insertRequest(request));
		}
		for (const environment of loadedData?.environments ?? []) {
			thunk.dispatch(activeActions.insertEnvironment(environment));
		}
		for (const script of loadedData?.scripts ?? []) {
			thunk.dispatch(activeActions.insertScript(script));
		}
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
