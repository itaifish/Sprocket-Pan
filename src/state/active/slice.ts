import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import {
	WorkspaceData,
	Endpoint,
	EndpointRequest,
	EndpointResponse,
	Environment,
	IdSpecificUiMetadata,
	NetworkFetchRequest,
	Script,
	Service,
} from '../../types/application-data/application-data';
import { AuditLog } from '../../managers/AuditLogManager';
import { log } from '../../utils/logging';
import { defaultWorkspaceData } from '../../managers/data/WorkspaceDataManager';
import { OrderedKeyValuePairs } from '../../classes/OrderedKeyValuePairs';

export type ActiveWorkspaceMetadata = {
	lastModified: number;
	lastSaved: number;
	autosaveInterval?: NodeJS.Timeout | undefined;
};
export type ActiveWorkspaceSlice = WorkspaceData & ActiveWorkspaceMetadata;

const initialState: ActiveWorkspaceSlice = {
	...defaultWorkspaceData,
	lastModified: 0,
	lastSaved: 0,
};

interface AddResponseToHistory {
	requestId: string;
	networkRequest: NetworkFetchRequest;
	response: EndpointResponse;
	auditLog?: AuditLog;
}

interface DeleteResponseFromHistory {
	requestId: string;
	historyIndex: number;
}

interface AddRequestToEndpoint {
	requestId: string;
	endpointId: string;
}

interface AddEndpointToService {
	endpointId: string;
	serviceId: string;
}

interface DeleteScript {
	scriptId: string;
}

export type Update<T, TKey extends string = 'id'> = Partial<Omit<T, TKey>> & { [key in TKey]: string };

export const activeSlice = createSlice({
	name: 'active',
	initialState: initialState,
	reducers: {
		setFullState: (state, action: PayloadAction<WorkspaceData>) => {
			Object.assign(state, action.payload);
			log.debug(`setFullState called`, 0);
		},
		setSavedNow: (state) => {
			state.lastSaved = new Date().getTime();
			log.debug(`setSavedNow called at time ${state.lastSaved}`, 0);
		},
		setModifiedNow: (state) => {
			state.lastModified = new Date().getTime();
			log.debug(`setModifiedNow called at time ${state.lastModified}`, 0);
		},
		setAutosaveInterval: (state, action: PayloadAction<NodeJS.Timeout | undefined>) => {
			if (state.autosaveInterval != undefined) {
				clearInterval(state.autosaveInterval);
			}
			state.autosaveInterval = action.payload;
		},
		// basic CRUD
		insertService: (state, action: PayloadAction<Service>) => {
			const service = action.payload;
			log.debug(`insertService called with service ${JSON.stringify(service)}`);
			Object.assign(state.services, { [service.id]: service });
		},
		updateService: (state, action: PayloadAction<Update<Service>>) => {
			const { id, ...updateFields } = action.payload;
			log.debug(`updateService called for fields ${JSON.stringify(updateFields)} on service ${id}`);
			Object.assign(state.services[id], updateFields);
		},
		insertEndpoint: (state, action: PayloadAction<Endpoint>) => {
			const endpoint = action.payload;
			log.debug(`insertEndpoint called with endpoint ${JSON.stringify(endpoint)}`);
			Object.assign(state.endpoints, { [endpoint.id]: endpoint });
		},
		updateEndpoint: (state, action: PayloadAction<Update<Endpoint>>) => {
			const { id, ...updateFields } = action.payload;
			log.debug(`updateEndpoint called for fields ${JSON.stringify(updateFields)} on endpoint ${id}`);
			Object.assign(state.endpoints[id], updateFields);
		},
		insertRequest: (state, action: PayloadAction<EndpointRequest>) => {
			const request = action.payload;
			log.debug(`insertRequest called with request ${JSON.stringify(request)}`);
			Object.assign(state.requests, { [request.id]: request });
		},
		updateRequest: (state, action: PayloadAction<Update<EndpointRequest>>) => {
			const { id, ...updateFields } = action.payload;
			log.debug(`updateRequest called for fields ${JSON.stringify(updateFields)} on request ${id}`);
			Object.assign(state.requests[id], updateFields);
		},
		insertEnvironment: (state, action: PayloadAction<Environment>) => {
			const environment = action.payload;
			log.debug(`insertEnvironment called with environment ${JSON.stringify(environment)}`);
			Object.assign(state.environments, { [environment.id]: environment });
		},
		updateEnvironment: (state, action: PayloadAction<Update<Environment, 'id'>>) => {
			const { id, ...updateFields } = action.payload;
			if (id == null) {
				throw new Error('attempted to update environment with null id');
			}
			log.debug(`updateEnvironment called for fields ${JSON.stringify(updateFields)} on environment ${id}`);
			Object.assign(state.environments[id], updateFields);
		},
		insertSettings: (state, action: PayloadAction<WorkspaceData['settings']>) => {
			log.debug(`insertSettings called with settings ${JSON.stringify(action.payload)}`);
			Object.assign(state.settings, action.payload);
		},
		setUiMetadataById: (state, action: PayloadAction<IdSpecificUiMetadata & { id: string }>) => {
			const { id, ...updateFields } = action.payload;
			if (state.uiMetadata.idSpecific[id] == null) {
				state.uiMetadata.idSpecific[id] = {};
			}
			Object.assign(state.uiMetadata.idSpecific[id], updateFields);
		},
		selectEnvironment: (state, action: PayloadAction<string | undefined>) => {
			log.debug(`selectEnvironment called on env ${action.payload}`);
			state.selectedEnvironment = action.payload;
		},
		deleteServiceFromState: (state, action: PayloadAction<string>) => {
			log.debug(`deleteServiceFromState called on service ${action.payload}`);
			delete state.services[action.payload];
		},
		deleteEndpointFromState: (state, action: PayloadAction<string>) => {
			log.debug(`deleteEndpointFromState called on endpoint ${action.payload}`);
			delete state.endpoints[action.payload];
		},
		deleteRequestFromState: (state, action: PayloadAction<string>) => {
			log.debug(`deleteRequestFromState called on endpoint ${action.payload}`);
			delete state.requests[action.payload];
		},
		deleteEnvironmentFromState: (state, action: PayloadAction<string>) => {
			log.debug(`deleteEnvironmentFromState called on env ${action.payload}`);
			delete state.environments[action.payload];
		},
		updateSecrets: (state, action: PayloadAction<OrderedKeyValuePairs>) => {
			state.secrets = action.payload;
		},
		// more specific logic
		addRequestToEndpoint: (state, action: PayloadAction<AddRequestToEndpoint>) => {
			const { endpointId, requestId } = action.payload;
			const endpoint = state.endpoints[endpointId];
			endpoint.requestIds.push(requestId);
			if (endpoint.defaultRequest == null) {
				endpoint.defaultRequest = requestId;
			}
			log.debug(`addRequestToEndpoint called on endpoint ${endpointId} for request ${requestId}`);
		},
		removeRequestFromEndpoint: (state, action: PayloadAction<string>) => {
			const requestId = action.payload;
			const { endpointId } = state.requests[requestId];
			state.endpoints[endpointId].requestIds = state.endpoints[endpointId].requestIds.filter((id) => id !== requestId);
			log.debug(`removeRequestFromEndpoint called on request ${requestId} for its endpoint ${endpointId} `);
		},
		addEndpointToService: (state, action: PayloadAction<AddEndpointToService>) => {
			const { endpointId, serviceId } = action.payload;
			state.services[serviceId].endpointIds.push(endpointId);
			log.debug(`addEndpointToService called on service ${serviceId} for endpoint ${endpointId}`);
		},
		removeEndpointFromService: (state, action: PayloadAction<string>) => {
			const endpointId = action.payload;
			const { serviceId } = state.endpoints[endpointId];
			state.services[serviceId].endpointIds = state.services[serviceId].endpointIds.filter((id) => id !== endpointId);
			log.debug(`removeEndpointFromService called on endpoint ${endpointId} for its service ${serviceId}`);
		},
		deleteAllHistory: (state) => {
			const requestIds = Object.keys(state.requests);
			for (const requestId in requestIds) {
				state.requests[requestId].history = [];
			}
			log.debug(`deleteAllHistory called`);
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
			log.debug(`addResponseToHistory called for request ${reqToUpdate.name}[${reqToUpdate.id}]`);
			log.trace(`new history item:\n${JSON.stringify(reqToUpdate.history[reqToUpdate.history.length - 1])}`);
		},
		deleteResponseFromHistory: (state, action: PayloadAction<DeleteResponseFromHistory>) => {
			const { requestId, historyIndex } = action.payload;
			const reqToUpdate = state.requests[requestId];
			if (reqToUpdate == null) {
				throw new Error('addResponseToHistory called with no associated request');
			}
			log.debug(`deleteResponseFromHistory called for request ${requestId} history item index ${historyIndex}`);
			reqToUpdate.history.splice(historyIndex, 1);
		},
		updateScript: (state, action: PayloadAction<Update<Script>>) => {
			const { id, ...updateFields } = action.payload;
			log.debug(`updateScript called for fields ${JSON.stringify(updateFields)} on script ${id}`);
			Object.assign(state.scripts[id], updateFields);
		},
		insertScript: (state, action: PayloadAction<Script>) => {
			log.debug(`insertScript called with script ${JSON.stringify(action.payload)}`);
			state.scripts[action.payload.id] = action.payload;
		},
		deleteScript: (state, action: PayloadAction<DeleteScript>) => {
			log.debug(`deleteScript called on script ${action.payload.scriptId}`);
			delete state.scripts[action.payload.scriptId];
		},
	},
});

export const {
	setFullState,
	setSavedNow,
	setModifiedNow,
	setAutosaveInterval,
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
	deleteResponseFromHistory,
	insertScript,
	deleteScript,
	updateScript,
	setUiMetadataById,
	updateSecrets,
} = activeSlice.actions;
