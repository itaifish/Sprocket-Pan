import { createSelector } from '@reduxjs/toolkit';
import { selectRequests, selectEndpoints, selectEnvironments, selectScripts, selectServices } from './active/selectors';
import { activeActions } from './active/slice';
import { globalActions } from './global/slice';
import { selectWorkspaces } from './global/selectors';

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

export const itemActions = {
	endpoint: {
		update: activeActions.updateEndpoint,
		delete: activeActions.deleteEndpoint,
		create: activeActions.createEndpoint,
		select: selectEndpoint,
		property: 'endpoints',
	},
	service: {
		update: activeActions.updateService,
		delete: activeActions.deleteService,
		create: activeActions.createService,
		select: selectService,
		property: 'services',
	},
	request: {
		update: activeActions.updateRequest,
		delete: activeActions.deleteRequest,
		create: activeActions.createRequest,
		select: selectRequest,
		property: 'requests',
	},
	script: {
		update: activeActions.updateScript,
		delete: activeActions.deleteScript,
		create: activeActions.createScript,
		select: selectScript,
		property: 'scripts',
	},
	environment: {
		update: activeActions.updateEnvironment,
		delete: activeActions.deleteEnvironment,
		create: activeActions.createEnvironment,
		select: selectEnvironment,
		property: 'environments',
	},
	workspace: {
		update: globalActions.updateWorkspace,
		delete: globalActions.deleteWorkspace,
		create: globalActions.createWorkspace,
		select: selectWorkspace,
		property: 'workspaces',
	},
};
