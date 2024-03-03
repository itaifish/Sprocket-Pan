import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { WorkspaceMetadata } from '../../types/application-data/application-data';

export interface WorkspaceState {
	selected?: WorkspaceMetadata;
	list: WorkspaceMetadata[];
}

const initialState: WorkspaceState = {
	list: [],
};

export const workspaceSlice = createSlice({
	name: 'workspace',
	initialState,
	reducers: {
		setWorkspaces: (state, action: PayloadAction<WorkspaceMetadata[]>) => {
			state.list = action.payload;
		},
		setWorkspace: (state, action: PayloadAction<WorkspaceMetadata>) => {
			state.selected = action.payload;
		},
		addWorkspace: (state, action: PayloadAction<WorkspaceMetadata>) => {
			state.list.push(action.payload);
		},
		deleteWorkspace: (state, action: PayloadAction<WorkspaceMetadata>) => {
			// filter used because I don't want to debug if splice works on redux state right now
			// tODO: this will change to just updating state to filesystem
			state.list = state.list.filter((workspace) => workspace.fileName !== action.payload.fileName);
		},
	},
});

export const { setWorkspaces, setWorkspace, deleteWorkspace, addWorkspace } = workspaceSlice.actions;
