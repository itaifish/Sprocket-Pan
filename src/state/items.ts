import { ActionCreatorWithPayload, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import { selectRequests, selectEndpoints, selectEnvironments, selectScripts, selectServices } from './active/selectors';
import { activeActions } from './active/slice';
import { globalActions } from './global/slice';
import { selectWorkspaces } from './global/selectors';
import {
	Endpoint,
	EndpointRequest,
	Environment,
	RootEnvironment,
	Script,
	Service,
	WorkspaceMetadata,
} from '@/types/data/workspace';
import { RootState } from './store';
import { Create } from './types';
import { ItemFactory } from '@/managers/data/ItemFactory';
import { uiActions } from './ui/slice';
import { ItemType } from '@/types/data/item';
import { getDescendents } from '@/utils/getters';

const selectRequest = createSelector([selectRequests, (_, id?: string) => id], (requests, id) =>
	id == null ? null : requests[id],
);

const selectEndpoint = createSelector([selectEndpoints, (_, id?: string) => id], (endpoints, id) =>
	id == null ? null : endpoints[id],
);

const selectEnvironment = createSelector(
	[selectEnvironments, (_, id: string) => id],
	(environments, id) => environments[id],
);

const selectScript = createSelector(
	[selectScripts, (_, scriptName: string) => scriptName],
	(scripts, scriptName) => scripts[scriptName],
);

const selectService = createSelector([selectServices, (_, id?: string) => id], (services, id) =>
	id == null ? null : services[id],
);

const selectWorkspace = createSelector([selectWorkspaces, (_, id?: string) => id], (workspaces, id) =>
	id == null ? null : workspaces[id],
);

// we need deletes to be thunks so that the tab is closed _first_. TODO: find an alternative?
const deletePrefix = 't/items/delete/';

function constructDeleteThunk(action: ActionCreatorWithPayload<string>, type: ItemType) {
	return createAsyncThunk<void, string, { state: RootState }>(deletePrefix + type, (id, thunk) => {
		thunk.dispatch(uiActions.closeTabs([id, ...getDescendents(thunk.getState().active, id)]));
		thunk.dispatch(action(id));
	});
}

// in some cases, we want to get the new id back after creating an item,
// so these need to be thunks.
const createPrefix = 't/items/create/';

const createRequest = createAsyncThunk<string, Create<EndpointRequest>, { state: RootState }>(
	createPrefix + 'request',
	(base, thunk) => {
		const newRequest = ItemFactory.request(base);
		thunk.dispatch(activeActions.insertRequest(newRequest));
		return newRequest.id;
	},
);

const createEndpoint = createAsyncThunk<string, Create<Endpoint>, { state: RootState }>(
	createPrefix + 'endpoint',
	({ requestIds, ...base } = {}, thunk) => {
		const state = thunk.getState().active;
		const newEndpoint = ItemFactory.endpoint(base);
		thunk.dispatch(activeActions.insertEndpoint(newEndpoint));
		// re: [''], we want at least one request made for a new endpoint automatically
		// this could be optimized with batch
		(requestIds ?? ['']).forEach(async (id) => {
			const newReqId = await thunk
				.dispatch(createRequest({ ...state.requests[id], endpointId: newEndpoint.id }))
				.unwrap();
			if (newEndpoint.defaultRequest === id || id === '') {
				thunk.dispatch(activeActions.updateEndpoint({ defaultRequest: newReqId, id: newEndpoint.id }));
			}
		});
		return newEndpoint.id;
	},
);

const createService = createAsyncThunk<string, Create<Service>, { state: RootState }>(
	createPrefix + 'service',
	({ endpointIds, ...base } = {}, thunk) => {
		const state = thunk.getState().active;
		const newService = ItemFactory.service(base);
		thunk.dispatch(activeActions.insertService(newService));
		endpointIds?.forEach((id) => {
			thunk.dispatch(createEndpoint({ ...state.endpoints[id], serviceId: newService.id }));
		});
		return newService.id;
	},
);

const createScript = createAsyncThunk<string, Create<Script>, { state: RootState }>(
	createPrefix + 'script',
	(base, thunk) => {
		const newScript = ItemFactory.script(base);
		thunk.dispatch(activeActions.insertScript(newScript));
		return newScript.id;
	},
);

const createEnvironment = createAsyncThunk<string, Create<RootEnvironment>, { state: RootState }>(
	createPrefix + 'environment',
	(base, thunk) => {
		const newEnv = ItemFactory.environment(base);
		thunk.dispatch(activeActions.insertEnvironment(newEnv));
		return newEnv.id;
	},
);

const createWorkspace = createAsyncThunk<string, Create<WorkspaceMetadata>, { state: RootState }>(
	createPrefix + 'workspace',
	(base, thunk) => {
		const newWorkspace = ItemFactory.workspace(base);
		thunk.dispatch(globalActions.insertWorkspace(newWorkspace));
		return newWorkspace.id;
	},
);

export const itemActions = {
	endpoint: {
		duplicate: (base: Endpoint) => createEndpoint({ ...base, name: base.name + ' (Copy)' }),
		update: activeActions.updateEndpoint,
		delete: constructDeleteThunk(activeActions.deleteEndpoint, ItemType.endpoint),
		create: createEndpoint,
		select: selectEndpoint,
		property: 'endpoints',
	},
	service: {
		duplicate: (base: Service) => createService({ ...base, name: base.name + ' (Copy)' }),
		update: activeActions.updateService,
		delete: constructDeleteThunk(activeActions.deleteService, ItemType.service),
		create: createService,
		select: selectService,
		property: 'services',
	},
	request: {
		duplicate: (base: EndpointRequest) => createRequest({ ...base, name: base.name + ' (Copy)' }),
		update: activeActions.updateRequest,
		delete: constructDeleteThunk(activeActions.deleteRequest, ItemType.request),
		create: createRequest,
		select: selectRequest,
		property: 'requests',
	},
	script: {
		duplicate: (base: Script) => createScript({ ...base, name: base.name + ' (Copy)' }),
		update: activeActions.updateScript,
		delete: constructDeleteThunk(activeActions.deleteScript, ItemType.script),
		create: createScript,
		select: selectScript,
		property: 'scripts',
	},
	environment: {
		duplicate: (base: Environment) => createEnvironment({ ...base, name: base.name + ' (Copy)' }),
		update: activeActions.updateEnvironment,
		delete: constructDeleteThunk(activeActions.deleteEnvironment, ItemType.script),
		create: createEnvironment,
		select: selectEnvironment,
		property: 'environments',
	},
	workspace: {
		duplicate: (base: WorkspaceMetadata) => createWorkspace({ ...base, name: base.name + ' (Copy)' }),
		update: globalActions.updateWorkspace,
		delete: constructDeleteThunk(globalActions.deleteWorkspace, ItemType.workspace),
		create: createWorkspace,
		select: selectWorkspace,
		property: 'workspaces',
	},
} as const;
