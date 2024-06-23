import { createSelector } from '@reduxjs/toolkit';
import { activeSlice } from './slice';

const selectActiveState = activeSlice.selectSlice;

export const selectSelectedEnvironment = createSelector(selectActiveState, (state) => state.selectedEnvironment);

export const selectEndpoints = createSelector(selectActiveState, (state) => state.endpoints);

export const selectServices = createSelector(selectActiveState, (state) => state.services);

export const selectEnvironments = createSelector(selectActiveState, (state) => {
	return state.environments;
});

export const selectRequests = createSelector(selectActiveState, (state) => state.requests);

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
