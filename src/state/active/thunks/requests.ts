import { createAsyncThunk } from '@reduxjs/toolkit';
import { AuditLog } from '../../../managers/AuditLogManager';
import { networkRequestManager } from '../../../managers/NetworkRequestManager';
import { RootState } from '../../store';
import {
	addRequestToEndpoint,
	addResponseToHistory,
	deleteRequestFromState,
	insertRequest,
	removeRequestFromEndpoint,
} from '../slice';
import { EndpointRequest } from '../../../types/application-data/application-data';
import { createNewRequestObject } from './util';
import { log } from '../../../utils/logging';

/**
 * Only exists until managers can be entirely migrated.
 * @deprecated
 */
function extractStateAccess(thunk: any) {
	return { getState: () => thunk.getState().active, dispatch: thunk.dispatch };
}

export const makeRequest = createAsyncThunk<
	string | undefined,
	{ requestId: string; auditLog?: AuditLog },
	{ state: RootState }
>('active/makeRequest', async ({ requestId, auditLog = [] }, thunk) => {
	const stateAccess = extractStateAccess(thunk);
	let error = await networkRequestManager.runPreScripts(requestId, stateAccess, auditLog);
	if (error) {
		log.warn(error);
		return error;
	}
	const { networkRequest, response } = await networkRequestManager.sendRequest(
		requestId,
		thunk.getState().active,
		auditLog,
	);
	error = await networkRequestManager.runPostScripts(requestId, stateAccess, response, auditLog);
	if (error) {
		log.warn(error);
		return error;
	}
	thunk.dispatch(addResponseToHistory({ requestId: requestId, response, networkRequest }));
});

interface AddNewRequest {
	data?: Partial<Omit<EndpointRequest, 'id' | 'endpointId'>>;
	endpointId: string;
}

export const addNewRequest = createAsyncThunk<void, AddNewRequest, { state: RootState }>(
	'active/addRequest',
	async ({ endpointId, data = {} }, thunk) => {
		const newRequest = { ...createNewRequestObject(endpointId), ...data };
		thunk.dispatch(insertRequest(newRequest));
		thunk.dispatch(addRequestToEndpoint({ requestId: newRequest.id, endpointId }));
	},
);

export const addNewRequestFromId = createAsyncThunk<void, string, { state: RootState }>(
	'active/addRequestFromId',
	async (requestId, thunk) => {
		const request = thunk.getState().active.requests[requestId];
		thunk.dispatch(addNewRequest({ endpointId: request.endpointId, data: request }));
	},
);

export const deleteRequest = createAsyncThunk<void, string, { state: RootState }>(
	'active/deleteRequest',
	async (id, thunk) => {
		thunk.dispatch(removeRequestFromEndpoint(id));
		thunk.dispatch(deleteRequestFromState(id));
	},
);
