import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { WorkspaceMetadata } from '../../types/application-data/application-data';
import { fileSystemManager } from '../../managers/FileSystemManager';
import { applicationDataManager } from '../../managers/ApplicationDataManager';

export interface WorkspaceState {
	selected?: WorkspaceMetadata;
	list: WorkspaceMetadata[];
}

const initialState: WorkspaceState = {
	list: [],
};

function resetWorkspace() {
	applicationDataManager.setWorkspace(undefined, undefined);
}

export const workspaceSlice = createSlice({
	name: 'workspace',
	initialState,
	reducers: {
		setWorkspaces: (state, action: PayloadAction<WorkspaceMetadata[]>) => {
			state.list = action.payload;
		},
		setWorkspace: (state, action: PayloadAction<WorkspaceMetadata | undefined>) => {
			state.selected = action.payload;
		},
		addWorkspace: (state, action: PayloadAction<WorkspaceMetadata>) => {
			state.list.push(action.payload);
		},
		deleteWorkspace: (state, action: PayloadAction<WorkspaceMetadata>) => {
			const fileName = action.payload.fileName;
			if (fileName == null) {
				throw new Error('cannot delete workspace without fileName');
			}
			fileSystemManager.deleteWorkspace(fileName);
			if (fileName === state.selected?.fileName) {
				resetWorkspace();
				state.selected = undefined;
			}
		},
	},
});

export const { setWorkspaces, setWorkspace, deleteWorkspace, addWorkspace } = workspaceSlice.actions;
