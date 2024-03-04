import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { WorkspaceMetadata } from '../../types/application-data/application-data';
import { applicationDataManager } from '../../managers/ApplicationDataManager';

export interface WorkspacesState {
	selected?: WorkspaceMetadata;
	list: WorkspaceMetadata[];
}

const initialState: WorkspacesState = {
	list: [],
};

export const workspacesSlice = createSlice({
	name: 'workspaces',
	initialState,
	reducers: {
		setWorkspaces: (state, action: PayloadAction<WorkspaceMetadata[]>) => {
			state.list = action.payload;
		},
		setWorkspace: (state, action: PayloadAction<WorkspaceMetadata | undefined>) => {
			state.selected = action.payload;
			applicationDataManager.setWorkspace(action.payload?.fileName, action.payload?.name);
		},
	},
});

export const { setWorkspaces, setWorkspace } = workspacesSlice.actions;
