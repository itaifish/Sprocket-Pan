import { createAsyncThunk, createSelector } from '@reduxjs/toolkit';
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

// in some cases, we want to get the new id back after creating an item,
// so these need to be thunks.
const prefix = 't/items/create/';

const createRequest = createAsyncThunk<string, Create<EndpointRequest>, { state: RootState }>(
	prefix + 'request',
	(base, thunk) => {
		const newRequest = ItemFactory.request(base);
		thunk.dispatch(activeActions.insertRequest(newRequest));
		return newRequest.id;
	},
);

const createEndpoint = createAsyncThunk<string, Create<Endpoint>, { state: RootState }>(
	prefix + 'endpoint',
	({ requestIds, ...base } = {}, thunk) => {
		const state = thunk.getState().active;
		const newEndpoint = ItemFactory.endpoint(base);
		// re: [''], we want at least one request made for a new endpoint automatically
		(requestIds ?? ['']).forEach((id) => {
			// this avoids using createRequest b/c of the need to set the defaultRequest & desire to avoid awaiting all the thunks
			const newRequest = ItemFactory.request({ ...state.requests[id], endpointId: newEndpoint.id });
			if (newEndpoint.defaultRequest === id) newEndpoint.defaultRequest = newRequest.id;
			thunk.dispatch(activeActions.insertRequest(newRequest));
		});
		thunk.dispatch(activeActions.insertEndpoint(newEndpoint));
		return newEndpoint.id;
	},
);

const createService = createAsyncThunk<string, Create<Service>, { state: RootState }>(
	prefix + 'service',
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
	prefix + 'script',
	(base, thunk) => {
		const newScript = ItemFactory.script(base);
		thunk.dispatch(activeActions.insertScript(newScript));
		return newScript.id;
	},
);

const createEnvironment = createAsyncThunk<string, Create<RootEnvironment>, { state: RootState }>(
	prefix + 'environment',
	(base, thunk) => {
		const newEnv = ItemFactory.environment(base);
		thunk.dispatch(activeActions.insertEnvironment(newEnv));
		return newEnv.id;
	},
);

const createWorkspace = createAsyncThunk<string, Create<WorkspaceMetadata>, { state: RootState }>(
	prefix + 'workspace',
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
		delete: activeActions.deleteEndpoint,
		create: createEndpoint,
		select: selectEndpoint,
		property: 'endpoints',
	},
	service: {
		duplicate: (base: Service) => createService({ ...base, name: base.name + ' (Copy)' }),
		update: activeActions.updateService,
		delete: activeActions.deleteService,
		create: createService,
		select: selectService,
		property: 'services',
	},
	request: {
		duplicate: (base: EndpointRequest) => createRequest({ ...base, name: base.name + ' (Copy)' }),
		update: activeActions.updateRequest,
		delete: activeActions.deleteRequest,
		create: createRequest,
		select: selectRequest,
		property: 'requests',
	},
	script: {
		duplicate: (base: Script) => createScript({ ...base, name: base.name + ' (Copy)' }),
		update: activeActions.updateScript,
		delete: activeActions.deleteScript,
		create: createScript,
		select: selectScript,
		property: 'scripts',
	},
	environment: {
		duplicate: (base: Environment) => createEnvironment({ ...base, name: base.name + ' (Copy)' }),
		update: activeActions.updateEnvironment,
		delete: activeActions.deleteEnvironment,
		create: createEnvironment,
		select: selectEnvironment,
		property: 'environments',
	},
	workspace: {
		duplicate: (base: WorkspaceMetadata) => createWorkspace({ ...base, name: base.name + ' (Copy)' }),
		update: globalActions.updateWorkspace,
		delete: globalActions.deleteWorkspace,
		create: createWorkspace,
		select: selectWorkspace,
		property: 'workspaces',
	},
};
