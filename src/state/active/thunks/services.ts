import { RootState } from '@/state/store';
import { tabsActions } from '@/state/tabs/slice';
import { Service } from '@/types/data/workspace';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { activeThunkName, activeActions } from '../slice';
import { addNewEndpoint } from './endpoints';
import { createNewServiceObject } from './util';

interface CloneServiceInput {
	data?: Partial<Omit<Service, 'id'>>;
}

export const cloneService = createAsyncThunk<string, CloneServiceInput, { state: RootState }>(
	`${activeThunkName}/cloneService`,
	async ({ data: { endpointIds, ...data } = {} }, thunk) => {
		const newService = { ...createNewServiceObject(), ...structuredClone(data), name: `${data.name} (Copy)` };
		thunk.dispatch(activeActions.insertService(newService));
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

type NewServiceArgs = Pick<Service, 'baseUrl' | 'description' | 'name'>;

export const addNewService = createAsyncThunk<string, NewServiceArgs, { state: RootState }>(
	`${activeThunkName}/addNewService`,
	async (serviceData, thunk) => {
		const newService = { ...createNewServiceObject(), ...serviceData };
		thunk.dispatch(activeActions.insertService(newService));
		return newService.id;
	},
);

export const cloneServiceFromId = createAsyncThunk<void, string, { state: RootState }>(
	`${activeThunkName}/cloneServiceFromId`,
	async (oldId, thunk) => {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { id, ...service } = thunk.getState().active.services[oldId];
		if (service != null) {
			thunk.dispatch(cloneService({ data: service }));
		}
	},
);

export const deleteService = createAsyncThunk<void, string, { state: RootState }>(
	`${activeThunkName}/deleteService`,
	async (id, thunk) => {
		const service = thunk.getState().active.services[id];
		if (service == null) {
			throw new Error('attempted to delete service that does not exist');
		}
		for (const endpointId in service.endpointIds) {
			thunk.dispatch(tabsActions.closeTab(endpointId));
			thunk.dispatch(activeActions.deleteEndpointFromState(endpointId));
		}
		thunk.dispatch(tabsActions.closeTab(service.id));
		thunk.dispatch(activeActions.deleteServiceFromState(service.id));
	},
);
