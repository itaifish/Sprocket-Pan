import { createSelector } from '@reduxjs/toolkit';
import { activeSlice } from './slice';

const selectActiveState = activeSlice.selectSlice;

export const selectAllItems = createSelector(selectActiveState, (state) => ({
	environments: state.environments,
	services: state.services,
	requests: state.requests,
	endpoints: state.endpoints,
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

export const selectHasBeenModifiedSinceLastSave = createSelector(
	selectSaveStateTimestamps,
	(time) => time.modified > time.saved,
);
