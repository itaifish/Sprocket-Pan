import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../store';
import {
	addEndpointToService,
	addRequestToEndpoint,
	deleteEndpointFromState,
	deleteEnvironmentFromState,
	deleteRequestFromState,
	deleteServiceFromState,
	removeEndpointFromService,
	removeRequestFromEndpoint,
	insertEndpoint,
	insertEnvironment,
	insertRequest,
	insertService,
	setIsModified,
	addResponseToHistory,
} from './slice';
import { Endpoint, EndpointRequest, Environment, Service } from '../../types/application-data/application-data';
import {
	createNewEndpointObject,
	createNewEnvironmentObject,
	createNewRequestObject,
	createNewServiceObject,
} from './util';
import { applicationDataManager } from '../../managers/ApplicationDataManager';
import { networkRequestManager } from '../../managers/NetworkRequestManager';
import { AuditLog } from '../../managers/AuditLogManager';


interface AddNewRequest {
	data?: Partial<Omit<EndpointRequest, 'id' | 'endpointId'>>;
	endpointId: string;
}

export const addNewRequest = createAsyncThunk<void, AddNewRequest, { state: RootState }>(
	'active/addRequest',
	async ({ endpointId, data = {} }, thunk) => {
		const newRequest = { ...createNewRequestObject(endpointId), ...data };
		await thunk.dispatch(insertRequest(newRequest));
		await thunk.dispatch(addRequestToEndpoint({ requestId: newRequest.id, endpointId }));
	},
);

export const deleteRequest = createAsyncThunk<void, string, { state: RootState }>(
	'active/deleteRequest',
	async (id, thunk) => {
		await thunk.dispatch(removeRequestFromEndpoint(id));
		await thunk.dispatch(deleteRequestFromState(id));
	},
);

interface AddNewEndpoint {
	data?: Partial<Omit<Endpoint, 'id' | 'serviceId'>>;
	serviceId: string;
}

export const addNewEndpoint = createAsyncThunk<void, AddNewEndpoint, { state: RootState }>(
	'active/addEndpoint',
	async ({ serviceId, data: { requestIds, ...data } = {} }, thunk) => {
		const newEndpoint = { ...createNewEndpointObject(serviceId), ...structuredClone(data) };
		await thunk.dispatch(insertEndpoint(newEndpoint));
		await thunk.dispatch(addEndpointToService({ endpointId: newEndpoint.id, serviceId }));
		const requests = thunk.getState().active.requests;
		for (const requestId of requestIds ?? []) {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { id, endpointId, ...request } = structuredClone(requests[requestId]);
			await thunk.dispatch(addNewRequest({ data: request, endpointId: newEndpoint.id }));
		}
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
			await thunk.dispatch(deleteRequestFromState(requestId));
		}
		await thunk.dispatch(removeEndpointFromService(endpoint.id));
		await thunk.dispatch(deleteEndpointFromState(endpoint.id));
	},
);

interface AddNewService {
	data?: Partial<Omit<Service, 'id'>>;
}

export const addNewService = createAsyncThunk<void, AddNewService, { state: RootState }>(
	'active/addService',
	async ({ data: { endpointIds, ...data } = {} }, thunk) => {
		const newService = { ...createNewServiceObject(), ...structuredClone(data) };
		await thunk.dispatch(insertService(newService));
		const endpoints = thunk.getState().active.endpoints;
		for (const endpointId of endpointIds ?? []) {
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

interface AddNewEnvironment {
	data?: Partial<Omit<Environment, 'id'>>;
}

// TODO: what is up with this and why is the typing broken
export const addNewEnvironment = createAsyncThunk<void, AddNewEnvironment, { state: RootState }>(
	'active/addEnvironment',
	async ({ data = {} }, thunk) => {
		const newEnvironment = {
			...createNewEnvironmentObject(),
			...data,
			__data: structuredClone(data.__data ?? []),
		};
		await thunk.dispatch(insertEnvironment(newEnvironment));
	},
);

export const deleteEnvironment = deleteEnvironmentFromState;

export const saveActiveData = createAsyncThunk<void, void, { state: RootState }>(
	'active/saveData',
	async (_, thunk) => {
		const { isModified, ...data } = thunk.getState().active;
		await thunk.dispatch(setIsModified(false));
		await applicationDataManager.saveData(data);
	},
);

export const makeRequest = createAsyncThunk<void, { requestId: string; auditLog?: AuditLog }, { state: RootState }>(
	'active/makeRequest',
	async ({ requestId, auditLog = [] }, thunk) => {
		await networkRequestManager.runPreScripts(requestId, thunk.getState().active, auditLog);
		const { networkRequest, response } = await networkRequestManager.sendRequest(
			requestId,
			thunk.getState().active,
			auditLog,
		);
		await networkRequestManager.runPostScripts(requestId, thunk.getState().active, response, auditLog);
		thunk.dispatch(addResponseToHistory({ requestId: requestId, response, networkRequest }));
	},
);
