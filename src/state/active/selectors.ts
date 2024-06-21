import { createSelector } from '@reduxjs/toolkit';
import { RootState, selectRootState } from '../store';
import { AuditLogState } from './slice';

export const selectActiveState = createSelector(selectRootState<RootState>, (state) => {
	console.log('reran active state selector');
	return state.active;
});

export const selectAuditLogState = createSelector(selectRootState<AuditLogState>, (state) => state);

export const selectSelectedEnvironment = createSelector(selectActiveState, (state) => state.selectedEnvironment);

export const selectEndpoints = createSelector(selectActiveState, (state) => state.endpoints);

export const selectServices = createSelector(selectActiveState, (state) => state.services);

export const selectEnvironments = createSelector(selectActiveState, (state) => {
	console.log('reran environments selector');
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
