import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { WorkspaceMetadata } from '../../types/application-data/application-data';
import { fileSystemManager } from '../../managers/FileSystemManager';
import { applicationDataManager } from '../../managers/ApplicationDataManager';

export interface WorkspacesState {
	selected?: WorkspaceMetadata;
	list: WorkspaceMetadata[];
}

const initialState: WorkspacesState = {
	list: [],
};

function resetWorkspace() {
	applicationDataManager.setWorkspace(undefined, undefined);
}

export const workspacesSlice = createSlice({
	name: 'workspaces',
	initialState,
	reducers: {
		setWorkspaces: (state, action: PayloadAction<WorkspaceMetadata[]>) => {
			state.list = action.payload;
		},
		setWorkspace: (state, action: PayloadAction<WorkspaceMetadata | undefined>) => {
			state.selected = action.payload;
		},
		addWorkspace: (_, action: PayloadAction<WorkspaceMetadata>) => {
			fileSystemManager.createWorkspace(action.payload);
		},
		deleteWorkspace: (state, action: PayloadAction<WorkspaceMetadata>) => {
			const fileName = action.payload.fileName;
			if (fileName == null) {
				throw new Error('cannot delete a workspace without a fileName');
			}
			fileSystemManager.deleteWorkspace(fileName);
			if (fileName === state.selected?.fileName) {
				resetWorkspace();
				state.selected = undefined;
			}
		},
	},
});

export const { setWorkspaces, setWorkspace, deleteWorkspace, addWorkspace } = workspacesSlice.actions;
