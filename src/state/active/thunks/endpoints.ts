import { createAsyncThunk } from '@reduxjs/toolkit';
import { Endpoint } from '../../../types/application-data/application-data';
import { RootState } from '../../store';
import { createNewEndpointObject } from './util';
import { addNewRequest } from './requests';
import { tabsActions } from '../../tabs/slice';
import { activeActions, activeThunkName } from '../slice';

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
		const endpoint = thunk.getState().active.endpoints[id];
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
