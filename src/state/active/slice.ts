import { defaultWorkspaceData } from '@/managers/data/WorkspaceDataManager';
import { IdSpecificUiMetadata } from '@/types/data/shared';
import {
	Endpoint,
	EndpointRequest,
	HistoricalEndpointResponse,
	RootEnvironment,
	Script,
	Service,
	SyncMetadata,
	WorkspaceData,
} from '@/types/data/workspace';
import { KeyValuePair } from '@/types/shared/keyValues';
import { RecursivePartial } from '@/types/utils/utils';
import { assignDeep, mergeDeep } from '@/utils/variables';
import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { Create, PayloadCreate, PayloadUpdate, Update } from '../types';
import { ItemFactory } from '@/managers/data/ItemFactory';
import { Item } from '@/types/data/item';

const initialState = {
	...defaultWorkspaceData,
	lastModified: 0,
	lastSaved: 0,
};

type State = typeof initialState;

interface AddResponseToHistory extends HistoricalEndpointResponse {
	requestId: string;
	maxLength: number;
	discard: boolean;
}

interface DeleteResponseFromHistory {
	requestId: string;
	historyIndex: number;
}

export interface UpdateLinkedEnv {
	envId: string;
	serviceEnvId: string;
	serviceId: string;
}

interface SetSelectedServiceEnvironment {
	serviceEnvId: string | undefined;
	serviceId: string;
}

function createRequest(state: State, data: Create<EndpointRequest>) {
	const newRequest = ItemFactory.request(data);
	state.requests[newRequest.id] = newRequest;
	state.endpoints[newRequest.endpointId].requestIds.push(newRequest.id);
	if (state.endpoints[newRequest.endpointId].defaultRequest == null) {
		state.endpoints[newRequest.endpointId].defaultRequest = newRequest.id;
	}
}

function deleteRequest(state: State, id: string) {
	const { endpointId } = state.requests[id];
	delete state.requests[id];
	state.endpoints[endpointId].requestIds = state.endpoints[endpointId].requestIds.filter((reqId) => reqId !== id);
}

function createEndpoint(state: State, { requestIds = [], ...data }: Create<Endpoint> = {}) {
	const newEndpoint = ItemFactory.endpoint(data);
	state.endpoints[newEndpoint.id] = newEndpoint;
	state.services[newEndpoint.serviceId].endpointIds.push(newEndpoint.id);
	for (const requestId of requestIds) {
		createRequest(state, { ...state.requests[requestId], endpointId: newEndpoint.id });
	}
}

function deleteEndpoint(state: State, id: string) {
	const { serviceId, requestIds } = state.endpoints[id];
	delete state.endpoints[id];
	state.services[serviceId].endpointIds = state.services[serviceId].endpointIds.filter((endId) => endId !== id);
	requestIds.forEach((reqId) => deleteRequest(state, reqId));
}

function createService(state: State, { endpointIds = [], ...data }: Create<Service> = {}) {
	const newService = ItemFactory.service(data);
	state.services[newService.id] = newService;
	for (const endpointId of endpointIds) {
		createEndpoint(state, { ...state.endpoints[endpointId], serviceId: newService.id });
	}
}

function deleteService(state: State, id: string) {
	const { endpointIds } = state.services[id];
	delete state.services[id];
	endpointIds.forEach((endId) => deleteEndpoint(state, endId));
}

function update<T extends Item>(state: { [key: string]: T }, item: Update<T>) {
	if (item.id == null) throw new Error("can't update item without an id");
	state[item.id] = { ...state[item.id], ...item };
}

export const activeSlice = createSlice({
	name: 'active',
	initialState: initialState,
	reducers: {
		setFullState: (state, { payload }: PayloadAction<WorkspaceData>) => {
			Object.assign(state, { ...initialState, ...payload });
		},
		injectState: (state, { payload }: PayloadCreate<WorkspaceData>) => {
			assignDeep(state, payload, 1);
		},
		setSavedNow: (state) => {
			state.lastSaved = new Date().getTime();
		},
		setModifiedNow: (state) => {
			state.lastModified = new Date().getTime();
		},
		createService: (state, { payload }: PayloadCreate<Service>) => createService(state, payload),
		updateService: (state, { payload }: PayloadUpdate<Service>) => update(state.services, payload),
		createEndpoint: (state, { payload }: PayloadCreate<Endpoint>) => createEndpoint(state, payload),
		updateEndpoint: (state, { payload }: PayloadUpdate<Endpoint>) => update(state.endpoints, payload),
		createRequest: (state, { payload }: PayloadCreate<EndpointRequest>) => createRequest(state, payload),
		updateRequest: (state, { payload }: PayloadUpdate<EndpointRequest>) => update(state.requests, payload),
		deleteService: (state, { payload }: PayloadAction<string>) => deleteService(state, payload),
		deleteEndpoint: (state, { payload }: PayloadAction<string>) => deleteEndpoint(state, payload),
		deleteRequest: (state, { payload }: PayloadAction<string>) => deleteRequest(state, payload),
		updateScript: (state, { payload }: PayloadUpdate<Script>) => update(state.scripts, payload),
		updateEnvironment: (state, { payload }: PayloadUpdate<RootEnvironment>) => update(state.environments, payload),
		createScript: (state, { payload }: PayloadCreate<Script>) => {
			const newScript = ItemFactory.script(payload);
			state.scripts[newScript.id] = newScript;
		},
		deleteScript: (state, action: PayloadAction<string>) => {
			delete state.scripts[action.payload];
		},
		createEnvironment: (state, { payload }: PayloadCreate<RootEnvironment>) => {
			const newEnv = ItemFactory.environment(payload);
			state.environments[newEnv.id] = newEnv;
		},
		insertSettings: (state, action: PayloadAction<WorkspaceData['settings']>) => {
			state.settings = action.payload;
		},
		setUiMetadataById: (state, action: PayloadAction<IdSpecificUiMetadata & { id: string }>) => {
			const { id, ...updateFields } = action.payload;
			if (state.uiMetadata.idSpecific[id] == null) {
				state.uiMetadata.idSpecific[id] = {};
			}
			Object.assign(state.uiMetadata.idSpecific[id], updateFields);
		},
		selectEnvironment: (state, action: PayloadAction<string | undefined>) => {
			for (const key in state.services) {
				if (state.services[key].linkedEnvMode) {
					state.selectedServiceEnvironments[key] = undefined;
				}
			}
			state.selectedEnvironment = action.payload;
			if (state.selectedEnvironment != null) {
				const linkedValues = Object.entries(state.environments[state.selectedEnvironment].linked ?? {});
				for (const [key, value] of linkedValues) {
					if (state.services[key].linkedEnvMode) {
						state.selectedServiceEnvironments[key] = value ?? undefined;
					}
				}
			}
		},
		deleteEnvironment: (state, action: PayloadAction<string>) => {
			delete state.environments[action.payload];
		},
		setSecrets: (state, action: PayloadAction<KeyValuePair[]>) => {
			state.secrets = action.payload;
		},
		deleteAllHistory: (state) => {
			state.history = {};
		},
		addResponseToHistory: (state, action: PayloadAction<AddResponseToHistory>) => {
			const { requestId, maxLength, discard, ...entry } = action.payload;
			// eliminate any errors in history (we only want the latest error) also instantiate empty histories
			state.history[requestId] = (state.history[requestId] ?? []).filter((entry) => entry.error == null);
			// don't pollute the data with a bunch of discard: falses
			if (discard) (entry as HistoricalEndpointResponse).discard = true;
			state.history[requestId].push(entry);
			if (maxLength > 0 && state.history[requestId].length > maxLength) {
				state.history[requestId].shift();
			}
		},
		deleteResponseFromHistory: (state, action: PayloadAction<DeleteResponseFromHistory>) => {
			const { requestId, historyIndex } = action.payload;
			state.history[requestId].splice(historyIndex, 1);
		},
		addLinkedEnv: (state, action: PayloadAction<UpdateLinkedEnv>) => {
			const { serviceEnvId, serviceId, envId } = action.payload;
			state.environments[envId].linked = {
				...state.environments[envId].linked,
				[serviceId]: serviceEnvId,
			};
			if (state.selectedEnvironment === envId) {
				state.selectedServiceEnvironments[serviceId] = serviceEnvId;
			}
		},
		removeLinkedEnv: (state, action: PayloadAction<Omit<UpdateLinkedEnv, 'serviceEnvId'>>) => {
			const { serviceId, envId } = action.payload;
			if (state.environments[envId].linked != null) {
				delete state.environments[envId].linked[serviceId];
			}
			if (state.selectedEnvironment === envId) {
				state.selectedServiceEnvironments[serviceId] = undefined;
			}
		},
		updateSyncMetadata: (state, action: PayloadAction<RecursivePartial<SyncMetadata>>) => {
			state.syncMetadata = mergeDeep(state.syncMetadata, action.payload);
		},
		setSyncItem: (state, action: PayloadAction<{ id: string; value: boolean }>) => {
			const { id, value } = action.payload;
			state.syncMetadata.items[id] = value;
		},
		setSyncItems: (state, action: PayloadAction<{ ids: string[]; value: boolean }>) => {
			const { ids, value } = action.payload;
			ids.forEach((id) => {
				state.syncMetadata.items[id] = value;
			});
		},
		setSelectedServiceEnvironment: (state, action: PayloadAction<SetSelectedServiceEnvironment>) => {
			const { serviceEnvId, serviceId } = action.payload;
			state.selectedServiceEnvironments[serviceId] = serviceEnvId;
		},
	},
});

export const activeActions = activeSlice.actions;

export const activeThunkName = `t/${activeSlice.name}`;
