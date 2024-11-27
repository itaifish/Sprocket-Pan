import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { GlobalData, WorkspaceMetadata } from '../../types/application-data/application-data';
import { Settings } from '../../types/settings/settings';

export interface GlobalState extends GlobalData {
	activeWorkspace?: WorkspaceMetadata;
}

const initialState: GlobalState = {
	workspaces: [],
	uiMetadata: { idSpecific: {}, elementSpecific: {} },
	settings: {} as Settings,
};

export const globalSlice = createSlice({
	name: 'global',
	initialState,
	reducers: {
		setWorkspaces: (state, action: PayloadAction<WorkspaceMetadata[]>) => {
			state.workspaces = action.payload;
		},
		setSelectedWorkspace: (state, action: PayloadAction<WorkspaceMetadata | undefined>) => {
			const workspace = action.payload;
			state.activeWorkspace = workspace;
		},
	},
});

export const globalActions = globalSlice.actions;
