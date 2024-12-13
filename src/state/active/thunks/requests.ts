import { createAsyncThunk } from '@reduxjs/toolkit';
import { activeActions, activeThunkName } from '../slice';
import { networkRequestManager } from '@/managers/NetworkRequestManager';
import { scriptRunnerManager } from '@/managers/scripts/ScriptRunnerManager';
import { RootState } from '@/state/store';
import { tabsActions } from '@/state/tabs/slice';
import { AuditLog, RequestEvent } from '@/types/data/audit';
import { Script, EndpointResponse, EndpointRequest } from '@/types/data/workspace';
import { SprocketError } from '@/types/state/state';
import { log } from '@/utils/logging';
import { createNewRequestObject } from './util';

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
>(`${activeThunkName}/runScript`, async (options, thunk) => {
	const stateAccess = { getState: () => thunk.getState(), dispatch: thunk.dispatch as any };

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
>(`${activeThunkName}/makeRequest`, async ({ requestId, auditLog = [] }, thunk) => {
	const stateAccess = { getState: () => thunk.getState(), dispatch: thunk.dispatch as any };
	const localAuditLog: AuditLog = [];
	let error = await networkRequestManager.runPreScripts(requestId, stateAccess, localAuditLog);
	if (error) {
		log.warn(error);
		return error;
	}
	const { networkRequest, response } = await networkRequestManager.sendRequest(
		requestId,
		thunk.getState(),
		localAuditLog,
	);
	error = await networkRequestManager.runPostScripts(requestId, stateAccess, response, localAuditLog);
	if (error) {
		log.warn(error);
		return error;
	}
	auditLog.push(...localAuditLog);
	const state = thunk.getState();
	thunk.dispatch(
		activeActions.addResponseToHistory({
			requestId: requestId,
			response,
			networkRequest,
			auditLog: localAuditLog,
			maxLength: state.active.settings.history?.maxLength ?? state.global.settings.history.maxLength,
		}),
	);
});

interface AddNewRequest {
	data?: Partial<Omit<EndpointRequest, 'id' | 'endpointId'>>;
	endpointId: string;
}

export const addNewRequest = createAsyncThunk<void, AddNewRequest, { state: RootState }>(
	`${activeThunkName}/addRequest`,
	async ({ endpointId, data = {} }, thunk) => {
		const newRequest: EndpointRequest = { ...createNewRequestObject(endpointId), ...data, history: [], endpointId };
		thunk.dispatch(activeActions.insertRequest(newRequest));
		thunk.dispatch(activeActions.addRequestToEndpoint({ requestId: newRequest.id, endpointId }));
	},
);

export const addNewRequestFromId = createAsyncThunk<void, string, { state: RootState }>(
	`${activeThunkName}/addNewRequestFromId`,
	async (requestId, thunk) => {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { id, ...request } = thunk.getState().active.requests[requestId];
		thunk.dispatch(
			addNewRequest({ endpointId: request.endpointId, data: { ...request, name: `${request.name} (Copy)` } }),
		);
	},
);

export const deleteRequest = createAsyncThunk<void, string, { state: RootState }>(
	`${activeThunkName}/deleteRequest`,
	async (id, thunk) => {
		thunk.dispatch(tabsActions.closeTab(id));
		thunk.dispatch(activeActions.removeRequestFromEndpoint(id));
		thunk.dispatch(activeActions.deleteRequestFromState(id));
	},
);
