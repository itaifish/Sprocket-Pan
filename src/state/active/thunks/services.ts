import { createAsyncThunk } from '@reduxjs/toolkit';
import { Service } from '../../../types/application-data/application-data';
import { RootState } from '../../store';
import { insertService, deleteEndpointFromState, deleteServiceFromState } from '../slice';
import { createNewServiceObject } from './util';
import { addNewEndpoint } from './endpoints';

interface AddNewService {
	data?: Partial<Omit<Service, 'id'>>;
}

export const addNewService = createAsyncThunk<void, AddNewService, { state: RootState }>(
	'active/addService',
	async ({ data: { endpointIds, ...data } = {} }, thunk) => {
		const newService = { ...createNewServiceObject(), ...structuredClone(data) };
		await thunk.dispatch(insertService(newService));
		const endpoints = thunk.getState().active.endpoints;
		// clone endpoints, if we're cloning the service
		for (const endpointId of endpointIds ?? []) {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { id, serviceId, ...endpoint } = structuredClone(endpoints[endpointId]);
			await thunk.dispatch(addNewEndpoint({ data: endpoint, serviceId: newService.id }));
		}
	},
);

export const deleteService = createAsyncThunk<void, string, { state: RootState }>(
	'active/deleteService',
	async (id, thunk) => {
		const service = thunk.getState().active.services[id];
		if (service == null) {
			throw new Error('attempted to delete service that does not exist');
		}
		for (const endpointId in service.endpointIds) {
			await thunk.dispatch(deleteEndpointFromState(endpointId));
		}
		await thunk.dispatch(deleteServiceFromState(service.id));
	},
);
