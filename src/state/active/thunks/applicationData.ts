import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../../store';
import { ParsedServiceApplicationData } from '../../../managers/parsers/SwaggerParseManager';
import { insertEndpoint, insertRequest, insertService } from '../slice';
import { log } from '../../../utils/logging';

export const InjectLoadedData = createAsyncThunk<void, ParsedServiceApplicationData, { state: RootState }>(
	'active/injectLoadedData',
	(loadedData, thunk) => {
		for (const service of loadedData.services) {
			thunk.dispatch(insertService(service));
			log.info(`Inserting ${service}`);
		}
		for (const endpoint of loadedData.endpoints) {
			thunk.dispatch(insertEndpoint(endpoint));
		}
		for (const request of loadedData.requests) {
			thunk.dispatch(insertRequest(request));
		}
	},
);
