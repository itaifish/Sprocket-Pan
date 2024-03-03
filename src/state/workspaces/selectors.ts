import { createSelector } from '@reduxjs/toolkit';
import { selectRootState } from '../store';

export const selectWorkspaceState = createSelector(selectRootState, (state) => state.workspace);

export const selectWorkspaceList = createSelector(selectWorkspaceState, (state) =>
	[...state.list].sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime()),
);

export const selectIsDefaultWorkspace = createSelector(selectWorkspaceState, (state) => state.selected == null);

export const selectActiveWorkspace = createSelector(selectWorkspaceState, (state) => state.selected);
