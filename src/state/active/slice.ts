import { defaultWorkspaceData } from '@/managers/data/WorkspaceDataManager';
import { IdSpecificUiMetadata } from '@/types/data/shared';
import {
	Endpoint,
	EndpointRequest,
	Environment,
	HistoricalEndpointResponse,
	RootEnvironment,
	Script,
	Service,
	SyncMetadata,
	WorkspaceData,
} from '@/types/data/workspace';
import { KeyValuePair } from '@/types/shared/keyValues';
import { RecursivePartial } from '@/types/utils/utils';
import { mergeDeep } from '@/utils/variables';
import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { Create, PayloadUpdate, Update } from '../types';
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

function deleteRequest(state: State, id: string) {
	const { endpointId } = state.requests[id];
	state.endpoints[endpointId].requestIds = state.endpoints[endpointId].requestIds.filter((reqId) => reqId !== id);
	if (state.endpoints[endpointId].defaultRequest === id) {
		state.endpoints[endpointId].defaultRequest = state.endpoints[endpointId].requestIds[0];
	}
	delete state.requests[id];
}

function deleteEndpoint(state: State, id: string) {
	const { serviceId, requestIds } = state.endpoints[id];
	state.services[serviceId].endpointIds = state.services[serviceId].endpointIds.filter((endId) => endId !== id);
	requestIds.forEach((reqId) => deleteRequest(state, reqId));
	delete state.endpoints[id];
}

function deleteService(state: State, id: string) {
	const { endpointIds } = state.services[id];
	endpointIds.forEach((endId) => deleteEndpoint(state, endId));
	delete state.services[id];
}

function update<T extends Item>(state: { [key: string]: T }, item: Update<T>) {
	if (item.id == null) {
		throw new Error("can't update item without an id");
	}
	state[item.id] = { ...state[item.id], ...item };
}

const injectableKeys: (keyof WorkspaceData)[] = [
	'endpoints',
	'environments',
	'requests',
	'scripts',
	'secrets',
	'services',
	'settings',
	'syncMetadata',
];

export const activeSlice = createSlice({
	name: 'active',
	initialState: initialState,
	reducers: {
		setFullState: (state, { payload }: PayloadAction<WorkspaceData>) => {
			const time = new Date().getTime();
			Object.assign(state, { ...initialState, ...payload, lastModified: time, lastSaved: time });
		},
		injectState: (state, { payload }: PayloadAction<Create<WorkspaceData>>) => {
			if (payload == null) {
				return;
			}
			injectableKeys.forEach((key) => {
				if (key in payload && payload[key] != null) {
					// I can't get typescript to shut up without putting never here.
					state[key] = mergeDeep(state[key], payload[key], undefined, 5) as never;
				}
			});
		},
		setSavedNow: (state) => {
			state.lastSaved = new Date().getTime();
		},
		setModifiedNow: (state) => {
			state.lastModified = new Date().getTime();
		},
		insertService: (state, { payload }: PayloadAction<Service>) => {
			state.services[payload.id] = payload;
		},
		insertEndpoint: (state, { payload }: PayloadAction<Endpoint>) => {
			state.endpoints[payload.id] = payload;
			state.services[payload.serviceId].endpointIds.push(payload.id);
		},
		insertRequest: (state, { payload }: PayloadAction<EndpointRequest>) => {
			state.requests[payload.id] = payload;
			state.endpoints[payload.endpointId].requestIds.push(payload.id);
		},
		insertScript: (state, { payload }: PayloadAction<Script>) => {
			state.scripts[payload.id] = payload;
		},
		insertEnvironment: (state, { payload }: PayloadAction<Environment>) => {
			state.environments[payload.id] = payload;
		},
		updateService: (state, { payload }: PayloadUpdate<Service>) => update(state.services, payload),
		updateEndpoint: (state, { payload }: PayloadUpdate<Endpoint>) => update(state.endpoints, payload),
		updateRequest: (state, { payload }: PayloadUpdate<EndpointRequest>) => update(state.requests, payload),
		deleteService: (state, { payload }: PayloadAction<string>) => deleteService(state, payload),
		deleteEndpoint: (state, { payload }: PayloadAction<string>) => deleteEndpoint(state, payload),
		deleteRequest: (state, { payload }: PayloadAction<string>) => deleteRequest(state, payload),
		updateScript: (state, { payload }: PayloadUpdate<Script>) => update(state.scripts, payload),
		updateEnvironment: (state, { payload }: PayloadUpdate<RootEnvironment>) => update(state.environments, payload),
		deleteScript: (state, action: PayloadAction<string>) => {
			delete state.scripts[action.payload];
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
			state.history = {
				// setting the requestId property directly leads to an immer error when history[requestId] is undefined
				...state.history,
				[requestId]: (state.history[requestId] ?? []).filter((entry) => entry.error == null),
			};
			// don't pollute the data with a bunch of discard: falses
			if (discard) {
				(entry as HistoricalEndpointResponse).discard = true;
			}
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
		addEndpointToService: (
			state,
			{ payload: { serviceId, id } }: PayloadAction<Pick<Endpoint, 'id' | 'serviceId'>>,
		) => {
			state.services[serviceId].endpointIds.push(id);
			state.endpoints[id].serviceId = serviceId;
		},
		addRequestToEndpoint: (
			state,
			{ payload: { endpointId, id } }: PayloadAction<Pick<EndpointRequest, 'id' | 'endpointId'>>,
		) => {
			state.endpoints[endpointId].requestIds.push(id);
			state.requests[id].endpointId = endpointId;
		},
		reset: () => initialState,
	},
});

export const activeActions = activeSlice.actions;

export const activeThunkName = `t/${activeSlice.name}`;

export type { Update };
