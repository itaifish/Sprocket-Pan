import { createSelector } from '@reduxjs/toolkit';
import { activeSlice } from './slice';
import { environmentContextResolver } from '../../managers/EnvironmentContextResolver';
import { queryParamsToString } from '../../utils/application';
import { TabType } from '../../types/state/state';
import { WorkspaceData } from '../../types/application-data/application-data';
import { selectGlobalState } from '../global/selectors';

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

// TODO: remember to actually deep merge these if there's any nested properties that matter in the future
export const selectUiMetadata = createSelector([selectActiveState, selectGlobalState], (activeState, globalState) => ({
	...globalState.uiMetadata,
	...activeState.uiMetadata,
}));

export const selectIdSpecificUiMetadata = createSelector(selectUiMetadata, (state) => state.idSpecific);
export const selectElementSpecificUiMetadata = createSelector(selectUiMetadata, (state) => state.elementSpecific);

export const selectUiMetadataById = createSelector(
	[selectIdSpecificUiMetadata, (_, id: string) => id],
	(state, id) => state[id],
);

export const selectUiMetadataByElement = createSelector(
	[selectElementSpecificUiMetadata, (_, id: string) => id],
	(state, id) => state[id],
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

export const selectPossibleTabInfo = createSelector(
	[selectEnvironments, selectServices, selectRequests, selectEndpoints, selectScripts],
	(environments, services, requests, endpoints, scripts) => {
		return { environments, requests, services, endpoints, scripts };
	},
);

function getMapFromTabType<TTabType extends TabType>(data: Pick<WorkspaceData, `${TTabType}s`>, tabType: TTabType) {
	return data[`${tabType}s`];
}

export const selectTabInfoById = createSelector(
	[selectPossibleTabInfo, (_, tab: [string, TabType]) => tab],
	(data, [tabId, tabType]) => {
		return getMapFromTabType(data, tabType)[tabId];
	},
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
