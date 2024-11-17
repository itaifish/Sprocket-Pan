import { createAsyncThunk } from '@reduxjs/toolkit';
import { Service } from '../../../types/application-data/application-data';
import { RootState } from '../../store';
import { insertService, deleteEndpointFromState, deleteServiceFromState } from '../slice';
import { createNewServiceObject } from './util';
import { addNewEndpoint } from './endpoints';
import { closeTab } from '../../tabs/slice';

interface CloneServiceInput {
	data?: Partial<Omit<Service, 'id'>>;
}

export const cloneService = createAsyncThunk<string, CloneServiceInput, { state: RootState }>(
	'active/cloneService',
	async ({ data: { endpointIds, ...data } = {} }, thunk) => {
		const newService = { ...createNewServiceObject(), ...structuredClone(data) };
		thunk.dispatch(insertService(newService));
		const endpoints = thunk.getState().active.endpoints;
		// clone endpoints, if we're cloning the service
		for (const endpointId of endpointIds ?? []) {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { id, serviceId, ...endpoint } = structuredClone(endpoints[endpointId]);
			await thunk.dispatch(addNewEndpoint({ data: endpoint, serviceId: newService.id }));
		}
		return newService.id;
	},
);

export const cloneServiceFromId = createAsyncThunk<void, string, { state: RootState }>(
	'active/cloneServiceFromId',
	async (oldId, thunk) => {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { id, userInterfaceData, ...service } = thunk.getState().active.services[oldId];
		if (service != null) {
			thunk.dispatch(cloneService({ data: service }));
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
			thunk.dispatch(closeTab(endpointId));
			thunk.dispatch(deleteEndpointFromState(endpointId));
		}
		thunk.dispatch(closeTab(service.id));
		thunk.dispatch(deleteServiceFromState(service.id));
	},
);
