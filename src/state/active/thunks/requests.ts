import { createAsyncThunk } from '@reduxjs/toolkit';
import { activeActions, activeThunkName } from '../slice';
import { RootState } from '@/state/store';
import { tabsActions } from '@/state/tabs/slice';
import { EndpointRequest } from '@/types/data/workspace';
import { createNewRequestObject } from './util';

interface AddNewRequest {
	data?: Partial<Omit<EndpointRequest, 'id' | 'endpointId'>>;
	endpointId: string;
}

export const addNewRequest = createAsyncThunk<void, AddNewRequest, { state: RootState }>(
	`${activeThunkName}/addRequest`,
	async ({ endpointId, data = {} }, thunk) => {
		const newRequest: EndpointRequest = { ...createNewRequestObject(endpointId), ...data, endpointId };
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
