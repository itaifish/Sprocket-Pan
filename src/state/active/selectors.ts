import { createSelector } from '@reduxjs/toolkit';
import { activeSlice } from './slice';
import { environmentContextResolver } from '../../managers/EnvironmentContextResolver';
import { queryParamsToString } from '../../utils/application';

const selectActiveState = activeSlice.selectSlice;

export const selectAllItems = createSelector(selectActiveState, (state) => ({
	environments: state.environments,
	services: state.services,
	requests: state.requests,
	endpoints: state.endpoints,
	scripts: state.scripts,
}));

export const selectSelectedEnvironment = createSelector(selectActiveState, (state) => state.selectedEnvironment);

export const selectEndpoints = createSelector(selectActiveState, (state) => state.endpoints);

export const selectEndpointById = createSelector(
	[selectEndpoints, (_, id: string) => id],
	(endpoints, id) => endpoints[id],
);

export const selectServices = createSelector(selectActiveState, (state) => state.services);

export const selectServicesById = createSelector(
	[selectServices, (_, id: string) => id],
	(services, id) => services[id],
);

export const selectEnvironments = createSelector(selectActiveState, (state) => {
	return state.environments;
});

export const selectEnvironmentIds = createSelector(selectEnvironments, (environments) => {
	return Object.values(environments).map((env) => env.__id);
});

export const selectEnvironmentsById = createSelector(
	[selectEnvironments, (_, id: string) => id],
	(environments, id) => environments[id],
);

export const selectRequests = createSelector(selectActiveState, (state) => state.requests);

export const selectRequestsById = createSelector(
	[selectRequests, (_, id: string) => id],
	(requests, id) => requests[id],
);

export const selectSettings = createSelector(selectActiveState, (state) => state.settings);

export const selectZoomLevel = createSelector(selectSettings, (state) => state.zoomLevel);

export const selectDefaultTheme = createSelector(selectSettings, (state) => state.defaultTheme);

export const selectSaveStateTimestamps = createSelector(selectActiveState, (state) => ({
	modified: state.lastModified,
	saved: state.lastSaved,
}));

export const selectScripts = createSelector(selectActiveState, (state) => state.scripts);
export const selectScript = createSelector(
	[selectScripts, (_, scriptName: string) => scriptName],
	(scripts, scriptName) => scripts[scriptName],
);

export const selectHasBeenModifiedSinceLastSave = createSelector(
	selectSaveStateTimestamps,
	(time) => time.modified > time.saved,
);

export const selectEnvironmentTypography = createSelector([selectActiveState, (_, id: string) => id], (state, id) => {
	const requestData = state.requests[id];
	const endpointData = state.endpoints[requestData?.endpointId];
	const serviceData = state.services[endpointData?.serviceId];
	const fullQueryParams = { ...endpointData.baseQueryParams, ...requestData.queryParams };
	let query = queryParamsToString(fullQueryParams);
	if (query) {
		query = `?${query}`;
	}
	return environmentContextResolver.stringWithVarsToTypography(
		`${serviceData.baseUrl}${endpointData.url}${query}`,
		state,
		serviceData.id,
		requestData.id,
	);
});
