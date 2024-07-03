import { createAsyncThunk } from '@reduxjs/toolkit';
import { AuditLog, RequestEvent } from '../../../managers/AuditLogManager';
import { networkRequestManager } from '../../../managers/NetworkRequestManager';
import { RootState } from '../../store';
import {
	addRequestToEndpoint,
	addResponseToHistory,
	deleteRequestFromState,
	insertRequest,
	removeRequestFromEndpoint,
} from '../slice';
import { EndpointRequest, EndpointResponse, Script } from '../../../types/application-data/application-data';
import { createNewRequestObject } from './util';
import { log } from '../../../utils/logging';
import { closeTab } from '../../tabs/slice';
import { scriptRunnerManager } from '../../../managers/ScriptRunnerManager';
import { SprocketError } from '../../../types/state/state';

/**
 * Only exists until managers can be entirely migrated.
 * @deprecated
 */
function extractStateAccess(thunk: any) {
	return { getState: () => thunk.getState().active, dispatch: thunk.dispatch };
}

export const runScript = createAsyncThunk<
	| {
			error: SprocketError;
	  }
	| unknown,
	{
		script: string | Script;
		requestId: string | null;
		response?: EndpointResponse | undefined;
		auditInfo?: {
			log: AuditLog;
			scriptType: Exclude<RequestEvent['eventType'], 'request'>;
			associatedId: string;
		};
	},
	{ state: RootState }
>('active/runScipt', async (options, thunk) => {
	const stateAccess = extractStateAccess(thunk);

	const result = await scriptRunnerManager.runTypescriptWithSprocketContext<unknown>(
		options.script,
		options.requestId,
		stateAccess,
		options.response,
		options.auditInfo,
	);
	return result;
});

export const makeRequest = createAsyncThunk<
	SprocketError | undefined,
	{ requestId: string; auditLog?: AuditLog },
	{ state: RootState }
>('active/makeRequest', async ({ requestId, auditLog = [] }, thunk) => {
	const stateAccess = extractStateAccess(thunk);
	const localAuditLog: AuditLog = [];
	let error = await networkRequestManager.runPreScripts(requestId, stateAccess, localAuditLog);
	if (error) {
		log.warn(error);
		return error;
	}
	const { networkRequest, response } = await networkRequestManager.sendRequest(
		requestId,
		thunk.getState().active,
		localAuditLog,
	);
	error = await networkRequestManager.runPostScripts(requestId, stateAccess, response, localAuditLog);
	if (error) {
		log.warn(error);
		return error;
	}
	auditLog.push(...localAuditLog);
	thunk.dispatch(addResponseToHistory({ requestId: requestId, response, networkRequest, auditLog: localAuditLog }));
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
		thunk.dispatch(closeTab(id));
		thunk.dispatch(removeRequestFromEndpoint(id));
		thunk.dispatch(deleteRequestFromState(id));
	},
);
