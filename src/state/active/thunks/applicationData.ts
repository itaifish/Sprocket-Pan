import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../../store';
import { ParsedServiceWorkspaceData } from '../../../managers/parsers/SwaggerParseManager';
import { log } from '../../../utils/logging';
import { Environment, Script } from '../../../types/application-data/application-data';
import { WorkspaceDataManager } from '../../../managers/data/WorkspaceDataManager';
import { activeActions, activeThunkName } from '../slice';

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
		console.log('attempting save w/', { lastModified, lastSaved });
		if (lastModified > lastSaved) {
			console.log('moving forward with it');
			thunk.dispatch(activeActions.setSavedNow());
			return WorkspaceDataManager.saveData(data);
		}
	},
);
