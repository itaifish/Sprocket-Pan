import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../../store';
import { ParsedServiceApplicationData } from '../../../managers/parsers/SwaggerParseManager';
import { insertEndpoint, insertEnvironment, insertRequest, insertScript, insertService, setSavedNow } from '../slice';
import { log } from '../../../utils/logging';
import { Environment, Script } from '../../../types/application-data/application-data';
import { applicationDataManager } from '../../../managers/ApplicationDataManager';

type ParsedApplicationData = ParsedServiceApplicationData & { environments?: Environment[]; scripts?: Script[] };

export const InjectLoadedData = createAsyncThunk<void, ParsedApplicationData, { state: RootState }>(
	'active/injectLoadedData',
	(loadedData, thunk) => {
		for (const service of loadedData.services) {
			thunk.dispatch(insertService(service));
			log.info(`Inserting ${service.name} [${service.id}]`);
		}
		for (const endpoint of loadedData.endpoints) {
			thunk.dispatch(insertEndpoint(endpoint));
		}
		for (const request of loadedData.requests) {
			thunk.dispatch(insertRequest(request));
		}
		for (const environment of loadedData?.environments ?? []) {
			thunk.dispatch(insertEnvironment(environment));
		}
		for (const script of loadedData?.scripts ?? []) {
			thunk.dispatch(insertScript(script));
		}
	},
);

export const saveActiveData = createAsyncThunk<void, void, { state: RootState }>(
	'active/saveData',
	async (_, thunk) => {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { lastModified, lastSaved, ...data } = thunk.getState().active;
		thunk.dispatch(setSavedNow());
		await applicationDataManager.saveData(data);
	},
);
