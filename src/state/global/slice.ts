import { DEFAULT_SETTINGS } from '@/constants/defaults';
import { GlobalDataManager } from '@/managers/data/GlobalDataManager';
import { GlobalData } from '@/types/data/global';
import { WorkspaceMetadata } from '@/types/data/workspace';
import { PayloadAction, createSlice } from '@reduxjs/toolkit';

export interface GlobalState extends GlobalData {
	activeWorkspace?: WorkspaceMetadata;
	workspaces: WorkspaceMetadata[];
}

const initialState: GlobalState = {
	workspaces: [],
	uiMetadata: { idSpecific: {} },
	settings: DEFAULT_SETTINGS,
	lastSaved: 0,
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
		insertSettings: (state, action: PayloadAction<GlobalState['settings']>) => {
			GlobalDataManager.saveGlobalData({ ...state, settings: action.payload, lastSaved: new Date().getTime() });
		},
		setData: (state, { payload }: PayloadAction<GlobalData>) => {
			state.settings = payload.settings;
			state.lastSaved = payload.lastSaved;
			state.uiMetadata = payload.uiMetadata;
		},
	},
});

export const globalActions = globalSlice.actions;
