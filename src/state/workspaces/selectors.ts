import { createSelector } from '@reduxjs/toolkit';
import { selectRootState } from '../store';

export const selectWorkspacesState = createSelector(selectRootState, (state) => state.workspaces);

export const selectWorkspacesList = createSelector(selectWorkspacesState, (state) =>
	[...state.list].sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime()),
);

export const selectActiveWorkspace = createSelector(selectWorkspacesState, (state) => state.selected);
