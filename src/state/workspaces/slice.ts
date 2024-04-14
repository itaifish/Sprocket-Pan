import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { WorkspaceMetadata } from '../../types/application-data/application-data';

const defaultWorkspace: WorkspaceMetadata = {
	name: 'Default Workspace',
	description: 'The default workspace in SprocketPan',
	lastModified: new Date(),
	fileName: undefined,
};

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
			const workspace = action.payload ?? defaultWorkspace;
			state.selected = workspace;
		},
	},
});

export const { setWorkspaces, setWorkspace } = workspacesSlice.actions;
