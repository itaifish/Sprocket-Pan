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

interface AddNewEndpoint {
	data?: Partial<Omit<Endpoint, 'id' | 'serviceId'>>;
	serviceId: string;
}

export const addNewEndpoint = createAsyncThunk<void, AddNewEndpoint, { state: RootState }>(
	'active/addEndpoint',
	async ({ serviceId, data: { requestIds, ...data } = {} }, thunk) => {
		const newEndpoint = { ...createNewEndpointObject(serviceId), ...structuredClone(data) };
		thunk.dispatch(insertEndpoint(newEndpoint));
		thunk.dispatch(addEndpointToService({ endpointId: newEndpoint.id, serviceId }));
		const requests = thunk.getState().active.requests;
		for (const requestId of requestIds ?? []) {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { id, endpointId, ...request } = structuredClone(requests[requestId]);
			await thunk.dispatch(addNewRequest({ data: request, endpointId: newEndpoint.id }));
		}
	},
);

export const addNewEndpointById = createAsyncThunk<void, string, { state: RootState }>(
	'active/addEndpointById',
	async (id, thunk) => {
		const endpoint = thunk.getState().active.endpoints[id];
		thunk.dispatch(addNewEndpoint({ serviceId: endpoint.serviceId, data: endpoint }));
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
			thunk.dispatch(deleteRequestFromState(requestId));
		}
		thunk.dispatch(removeEndpointFromService(endpoint.id));
		thunk.dispatch(deleteEndpointFromState(endpoint.id));
	},
);
