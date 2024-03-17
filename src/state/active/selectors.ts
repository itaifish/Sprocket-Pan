import { createSelector } from '@reduxjs/toolkit';
import { selectRootState } from '../store';

export const selectActiveState = createSelector(selectRootState, (state) => state.active);

export const selectSelectedEnvironment = createSelector(selectActiveState, (state) => state.selectedEnvironment);

export const selectEndpoints = createSelector(selectActiveState, (state) => state.endpoints);

export const selectServices = createSelector(selectActiveState, (state) => state.services);

export const selectEnvironments = createSelector(selectActiveState, (state) => state.environments);

export const selectRequests = createSelector(selectActiveState, (state) => state.requests);

export const selectSettings = createSelector(selectActiveState, (state) => state.settings);

export const selectZoomLevel = createSelector(selectSettings, (state) => state.zoomLevel);

export const selectDefaultTheme = createSelector(selectSettings, (state) => state.defaultTheme);

export const selectIsModified = createSelector(selectActiveState, (state) => state.isModified);
