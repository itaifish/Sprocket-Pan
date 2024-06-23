import { createSelector } from '@reduxjs/toolkit';
import { workspacesSlice } from './slice';

export const selectWorkspacesList = createSelector(workspacesSlice.selectSlice, (state) =>
	[...state.list].sort((a, b) => b.lastModified - a.lastModified),
);

export const selectActiveWorkspace = createSelector(workspacesSlice.selectSlice, (state) => state.selected);
