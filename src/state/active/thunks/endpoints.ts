import { createAsyncThunk } from '@reduxjs/toolkit';
import { activeActions, activeThunkName } from '../slice';
import { RootState } from '@/state/store';
import { tabsActions } from '@/state/tabs/slice';
import { Endpoint } from '@/types/data/workspace';
import { addNewRequest } from './requests';
import { createNewEndpointObject } from './util';

interface AddNewEndpoint {
	data?: Partial<Omit<Endpoint, 'id' | 'serviceId'>>;
	serviceId: string;
}

export const addNewEndpoint = createAsyncThunk<string, AddNewEndpoint, { state: RootState }>(
	`${activeThunkName}/addNewEndpoint`,
	async ({ serviceId, data: { requestIds, ...data } = {} }, thunk) => {
		const newEndpoint: Endpoint = {
			...createNewEndpointObject(serviceId),
			...structuredClone(data),
			defaultRequest: null,
			requestIds: [],
			serviceId,
		};
		thunk.dispatch(activeActions.insertEndpoint(newEndpoint));
		thunk.dispatch(activeActions.addEndpointToService({ endpointId: newEndpoint.id, serviceId }));
		const requests = thunk.getState().active.requests;
		for (const requestId of requestIds ?? []) {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { id, endpointId, ...request } = structuredClone(requests[requestId]);
			await thunk.dispatch(addNewRequest({ data: request, endpointId: newEndpoint.id }));
		}
		return newEndpoint.id;
	},
);

export const addNewEndpointById = createAsyncThunk<void, string, { state: RootState }>(
	`${activeThunkName}/addNewEndpointById`,
	async (oldId, thunk) => {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { id, ...endpoint } = thunk.getState().active.endpoints[oldId];
		thunk.dispatch(
			addNewEndpoint({ serviceId: endpoint.serviceId, data: { ...endpoint, name: `${endpoint.name} (Copy)` } }),
		);
	},
);

export const deleteEndpoint = createAsyncThunk<void, string, { state: RootState }>(
	`${activeThunkName}/deleteEndpoint`,
	async (id, thunk) => {
		const state = thunk.getState().active;
		const endpoint = state.endpoints[id];
		if (endpoint == null) {
			throw new Error('attempted to delete endpoint that does not exist');
		}
		for (const requestId in endpoint.requestIds) {
			thunk.dispatch(tabsActions.closeTab(requestId));
			thunk.dispatch(activeActions.deleteRequestFromState(requestId));
		}
		thunk.dispatch(tabsActions.closeTab(endpoint.id));
		thunk.dispatch(activeActions.removeEndpointFromService(endpoint.id));
		thunk.dispatch(activeActions.deleteEndpointFromState(endpoint.id));
	},
);
