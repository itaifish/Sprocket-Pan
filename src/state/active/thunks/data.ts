import { WorkspaceDataManager } from '@/managers/data/WorkspaceDataManager';
import { ParsedServiceWorkspaceData } from '@/managers/parsers/SwaggerParseManager';
import { RootState } from '@/state/store';
import { Environment, Script } from '@/types/data/workspace';
import { log } from '@/utils/logging';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { activeThunkName, activeActions } from '../slice';
import { getAncestors, getDescendents } from '@/utils/getters';

type ParsedWorkspaceData = ParsedServiceWorkspaceData & { environments?: Environment[]; scripts?: Script[] };

export const injectLoadedData = createAsyncThunk<void, ParsedWorkspaceData, { state: RootState }>(
	`${activeThunkName}/saveData`,
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
	(_, thunk) => {
		const { lastModified, lastSaved, ...data } = thunk.getState().active;
		if (lastModified > lastSaved) {
			thunk.dispatch(activeActions.setSavedNow());
			return WorkspaceDataManager.saveData(data);
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
