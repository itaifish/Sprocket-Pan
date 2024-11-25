import { createSelector } from '@reduxjs/toolkit';
import { globalSlice } from './slice';

export const selectGlobalState = globalSlice.selectSlice;

export const selectWorkspacesList = createSelector(selectGlobalState, (state) =>
	[...state.workspaces].sort((a, b) => b.lastModified - a.lastModified),
);

export const selectActiveWorkspace = createSelector(selectGlobalState, (state) => state.activeWorkspace);
