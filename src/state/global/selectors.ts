import { createSelector } from '@reduxjs/toolkit';
import { globalSlice } from './slice';

export const selectGlobalState = globalSlice.selectSlice;

export const selectWorkspaces = createSelector(selectGlobalState, (state) => state.workspaces);

export const selectWorkspacesList = createSelector(selectWorkspaces, (workspaces) =>
	Object.values(workspaces).sort((a, b) => b.lastModified - a.lastModified),
);

export const selectActiveWorkspace = createSelector(selectGlobalState, (state) =>
	state.activeWorkspace == null ? null : state.workspaces[state.activeWorkspace],
);

export const selectGlobalSettings = createSelector(selectGlobalState, (state) => state.settings);

export const selectGlobalLastSaved = createSelector(selectGlobalState, (state) => state.lastSaved);
