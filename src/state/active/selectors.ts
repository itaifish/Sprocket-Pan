import { createSelector } from '@reduxjs/toolkit';
import { activeSlice } from './slice';
import { OrderedKeyValuePairs } from '@/classes/OrderedKeyValuePairs';
import { EnvironmentContextResolver } from '@/managers/EnvironmentContextResolver';
import { queryParamsToString } from '@/utils/application';
import { mergeDeep } from '@/utils/variables';
import { selectGlobalState, selectGlobalSettings } from '../global/selectors';

export const selectActiveState = activeSlice.selectSlice;

export const selectSelectedEnvironment = createSelector(selectActiveState, (state) => state.selectedEnvironment);

export const selectSelectedEnvironmentValue = createSelector(selectActiveState, (state) =>
	state.selectedEnvironment == null ? null : state.environments[state.selectedEnvironment],
);

// we're handling state secrets lol
export const selectSecrets = createSelector(selectActiveState, (state) => state.secrets);

export const selectEndpoints = createSelector(selectActiveState, (state) => state.endpoints);

export const selectServices = createSelector(selectActiveState, (state) => state.services);

export const selectSelectedServiceEnvironments = createSelector(
	selectActiveState,
	(state) => state.selectedServiceEnvironments,
);

export const selectEnvironments = createSelector(selectActiveState, (state) => {
	return state.environments;
});

export const selectEnvironmentIds = createSelector(selectEnvironments, (environments) => {
	return Object.values(environments).map((env) => env.id);
});

export const selectRequests = createSelector(selectActiveState, (state) => state.requests);

export const selectHistory = createSelector(selectActiveState, (state) => state.history);

export const selectHistoryById = createSelector([selectHistory, (_, id?: string) => id], (history, id) =>
	id == null ? [] : (history[id] ?? []),
);

export const selectFullRequestInfoById = createSelector(
	[selectRequests, selectEndpoints, selectServices, (_, id: string) => id],
	(requests, endpoints, services, id) => {
		const request = requests[id];
		const endpoint = endpoints[request?.endpointId];
		const service = services[endpoint?.serviceId];
		return {
			request,
			endpoint,
			service,
		};
	},
);

export const selectUiMetadata = createSelector([selectActiveState, selectGlobalState], (activeState, globalState) =>
	mergeDeep(globalState.uiMetadata, activeState.uiMetadata),
);

export const selectAllItems = createSelector(selectActiveState, selectGlobalState, (active, global) => ({
	environments: active.environments,
	services: active.services,
	requests: active.requests,
	endpoints: active.endpoints,
	scripts: active.scripts,
	workspaces: global.workspaces,
}));

export const selectIdSpecificUiMetadata = createSelector(selectUiMetadata, (state) => state.idSpecific);

export const selectUiMetadataById = createSelector(
	[selectIdSpecificUiMetadata, (_, id: string) => id],
	(state, id) => state[id],
);

export const selectWorkspaceSettings = createSelector(selectActiveState, (state) => state?.settings);

export const selectSettings = createSelector(selectGlobalSettings, selectWorkspaceSettings, (global, workspace) =>
	mergeDeep(global, workspace),
);

export const selectZoomLevel = createSelector(selectSettings, (state) => state.theme.zoom);

export const selectDefaultTheme = createSelector(selectSettings, (state) => state.theme.base);

export const selectTheme = createSelector(selectSettings, (state) => state.theme);

export const selectSaveStateTimestamps = createSelector(selectActiveState, (state) => ({
	modified: state.lastModified,
	saved: state.lastSaved,
}));

export const selectScripts = createSelector(selectActiveState, (state) => state.scripts);

export const selectHasBeenModifiedSinceLastSave = createSelector(
	selectSaveStateTimestamps,
	(time) => time.modified > time.saved,
);

export const selectEnvironmentSnippets = createSelector([selectActiveState, (_, id: string) => id], (state, id) => {
	const requestData = state.requests[id];
	const endpointData = state.endpoints[requestData?.endpointId];
	const serviceData = state.services[endpointData?.serviceId];
	const servEnvId = state.selectedServiceEnvironments[serviceData.id];
	const fullQueryParams = new OrderedKeyValuePairs(endpointData.baseQueryParams, requestData.queryParams);
	let query = queryParamsToString(fullQueryParams.toArray());
	if (query) {
		query = `?${query}`;
	}
	return EnvironmentContextResolver.stringWithVarsToSnippet(`${serviceData.baseUrl}${endpointData.url}${query}`, {
		secrets: state.secrets,
		servEnv: servEnvId == null ? null : serviceData.localEnvironments[servEnvId],
		reqEnv: requestData.environmentOverride,
		rootEnv: state.selectedEnvironment == null ? null : state.environments[state.selectedEnvironment],
		rootAncestors: Object.values(state.environments),
	});
});

export const selectSyncMetadata = createSelector(selectActiveState, (state) => state.syncMetadata);
