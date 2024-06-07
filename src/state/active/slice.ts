import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import {
	ApplicationData,
	Endpoint,
	EndpointRequest,
	EndpointResponse,
	Environment,
	NetworkFetchRequest,
	Service,
} from '../../types/application-data/application-data';
import { AuditLog } from '../../managers/AuditLogManager';
import { defaultApplicationData } from '../../managers/ApplicationDataManager';

export interface ActiveWorkspaceSlice extends ApplicationData {
	lastModified: number;
	lastSaved: number;
}

const initialState: ActiveWorkspaceSlice = {
	...defaultApplicationData,
	lastModified: 0,
	lastSaved: 0,
};

interface AddResponseToHistory {
	requestId: string;
	networkRequest: NetworkFetchRequest;
	response: EndpointResponse;
	auditLog?: AuditLog;
}

interface AddRequestToEndpoint {
	requestId: string;
	endpointId: string;
}

interface AddEndpointToService {
	endpointId: string;
	serviceId: string;
}

type Update<T> = Partial<Omit<T, 'id'>> & { id: string };

export const activeSlice = createSlice({
	name: 'active',
	initialState: initialState,
	reducers: {
		setFullState: (state, action: PayloadAction<ApplicationData>) => {
			Object.assign(state, action.payload);
		},
		setSavedNow: (state) => {
			state.lastSaved = new Date().getTime();
		},
		setModifiedNow: (state) => {
			state.lastModified = new Date().getTime();
		},
		// basic CRUD
		insertService: (state, action: PayloadAction<Service>) => {
			const service = action.payload;
			Object.assign(state.services, { [service.id]: service });
		},
		updateService: (state, action: PayloadAction<Update<Service>>) => {
			const { id, ...updateFields } = action.payload;
			Object.assign(state.services[id], updateFields);
		},
		insertEndpoint: (state, action: PayloadAction<Endpoint>) => {
			const endpoint = action.payload;
			Object.assign(state.endpoints, { [endpoint.id]: endpoint });
		},
		updateEndpoint: (state, action: PayloadAction<Update<Endpoint>>) => {
			const { id, ...updateFields } = action.payload;
			Object.assign(state.endpoints[id], updateFields);
		},
		insertRequest: (state, action: PayloadAction<EndpointRequest>) => {
			const request = action.payload;
			Object.assign(state.requests, { [request.id]: request });
		},
		updateRequest: (state, action: PayloadAction<Update<EndpointRequest>>) => {
			const { id, ...updateFields } = action.payload;
			Object.assign(state.requests[id], updateFields);
		},
		insertEnvironment: (state, action: PayloadAction<Environment>) => {
			const environment = action.payload;
			Object.assign(state.environments, { [environment.__id]: environment });
		},
		updateEnvironment: (state, action: PayloadAction<Update<Environment>>) => {
			const { __id, ...updateFields } = action.payload;
			if (__id == null) {
				throw new Error('attempted to update environment with null __id');
			}
			Object.assign(state.environments[__id], updateFields);
		},
		insertSettings: (state, action: PayloadAction<ApplicationData['settings']>) => {
			Object.assign(state.settings, action.payload);
		},
		selectEnvironment: (state, action: PayloadAction<string | undefined>) => {
			state.selectedEnvironment = action.payload;
		},
		deleteServiceFromState: (state, action: PayloadAction<string>) => {
			delete state.services[action.payload];
		},
		deleteEndpointFromState: (state, action: PayloadAction<string>) => {
			delete state.endpoints[action.payload];
		},
		deleteRequestFromState: (state, action: PayloadAction<string>) => {
			delete state.requests[action.payload];
		},
		deleteEnvironmentFromState: (state, action: PayloadAction<string>) => {
			delete state.environments[action.payload];
		},
		// more specific logic
		addRequestToEndpoint: (state, action: PayloadAction<AddRequestToEndpoint>) => {
			const { endpointId, requestId } = action.payload;
			const endpoint = state.endpoints[endpointId];
			endpoint.requestIds.push(requestId);
			if (endpoint.defaultRequest == null) {
				endpoint.defaultRequest = requestId;
			}
		},
		removeRequestFromEndpoint: (state, action: PayloadAction<string>) => {
			const requestId = action.payload;
			const { endpointId } = state.requests[requestId];
			state.endpoints[endpointId].requestIds = state.endpoints[endpointId].requestIds.filter((id) => id !== requestId);
		},
		addEndpointToService: (state, action: PayloadAction<AddEndpointToService>) => {
			const { endpointId, serviceId } = action.payload;
			state.services[serviceId].endpointIds.push(endpointId);
		},
		removeEndpointFromService: (state, action: PayloadAction<string>) => {
			const endpointId = action.payload;
			const { serviceId } = state.endpoints[endpointId];
			state.services[serviceId].endpointIds = state.services[serviceId].endpointIds.filter((id) => id !== endpointId);
		},
		deleteAllHistory: (state) => {
			const requestIds = Object.keys(state.requests);
			for (const requestId in requestIds) {
				state.requests[requestId].history = [];
			}
		},
		addResponseToHistory: (state, action: PayloadAction<AddResponseToHistory>) => {
			const { requestId, networkRequest, response, auditLog } = action.payload;
			const reqToUpdate = state.requests[requestId];
			if (reqToUpdate == null) {
				throw new Error('addResponseToHistory called with no associated request');
			}
			reqToUpdate.history.push({
				request: networkRequest,
				response,
				auditLog,
			});
			if (state.settings.maxHistoryLength > 0 && reqToUpdate.history.length > state.settings.maxHistoryLength) {
				reqToUpdate.history.shift();
			}
		},
	},
});

export const {
	setFullState,
	setSavedNow,
	setModifiedNow,
	insertService,
	updateService,
	insertEndpoint,
	updateEndpoint,
	insertRequest,
	updateRequest,
	insertEnvironment,
	updateEnvironment,
	insertSettings,
	selectEnvironment,
	deleteEndpointFromState,
	deleteEnvironmentFromState,
	deleteRequestFromState,
	deleteServiceFromState,
	addRequestToEndpoint,
	removeRequestFromEndpoint,
	addEndpointToService,
	removeEndpointFromService,
	deleteAllHistory,
	addResponseToHistory,
} = activeSlice.actions;
