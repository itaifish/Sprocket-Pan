import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { GlobalData, WorkspaceMetadata } from '../../types/application-data/application-data';
import { DEFAULT_SETTINGS } from '../../constants/defaults';

export interface GlobalState extends GlobalData {
	activeWorkspace?: WorkspaceMetadata;
}

const initialState: GlobalState = {
	workspaces: [],
	uiMetadata: { idSpecific: {} },
	settings: DEFAULT_SETTINGS,
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
