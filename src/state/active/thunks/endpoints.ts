import { createAsyncThunk } from '@reduxjs/toolkit';
import { Endpoint } from '../../../types/application-data/application-data';
import { RootState } from '../../store';
import {
	insertEndpoint,
	addEndpointToService,
	deleteRequestFromState,
	removeEndpointFromService,
	deleteEndpointFromState,
} from '../slice';
import { createNewEndpointObject } from './util';
import { addNewRequest } from './requests';
import { tabsActions } from '../../tabs/slice';

interface AddNewEndpoint {
	data?: Partial<Omit<Endpoint, 'id' | 'serviceId'>>;
	serviceId: string;
}

export const addNewEndpoint = createAsyncThunk<string, AddNewEndpoint, { state: RootState }>(
	'active/addEndpoint',
	async ({ serviceId, data: { requestIds, ...data } = {} }, thunk) => {
		const newEndpoint: Endpoint = {
			...createNewEndpointObject(serviceId),
			...structuredClone(data),
			defaultRequest: null,
			requestIds: [],
			serviceId,
		};
		thunk.dispatch(insertEndpoint(newEndpoint));
		thunk.dispatch(addEndpointToService({ endpointId: newEndpoint.id, serviceId }));
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
	'active/addEndpointById',
	async (oldId, thunk) => {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { id, ...endpoint } = thunk.getState().active.endpoints[oldId];
		thunk.dispatch(
			addNewEndpoint({ serviceId: endpoint.serviceId, data: { ...endpoint, name: `${endpoint.name} (Copy)` } }),
		);
	},
);

export const deleteEndpoint = createAsyncThunk<void, string, { state: RootState }>(
	'active/deleteEndpoint',
	async (id, thunk) => {
		const endpoint = thunk.getState().active.endpoints[id];
		if (endpoint == null) {
			throw new Error('attempted to delete endpoint that does not exist');
		}
		for (const requestId in endpoint.requestIds) {
			thunk.dispatch(tabsActions.closeTab(requestId));
			thunk.dispatch(deleteRequestFromState(requestId));
		}
		thunk.dispatch(tabsActions.closeTab(endpoint.id));
		thunk.dispatch(removeEndpointFromService(endpoint.id));
		thunk.dispatch(deleteEndpointFromState(endpoint.id));
	},
);
