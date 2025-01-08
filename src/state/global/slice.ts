import { DEFAULT_SETTINGS } from '@/constants/defaults';
import { GlobalDataManager } from '@/managers/data/GlobalDataManager';
import { GlobalData } from '@/types/data/global';
import { WorkspaceMetadata } from '@/types/data/workspace';
import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { PayloadUpdate } from '../types';
import { ItemFactory } from '@/managers/data/ItemFactory';

export interface GlobalState extends GlobalData {
	activeWorkspace?: WorkspaceMetadata;
	workspaces: { [key: string]: WorkspaceMetadata };
}

const initialState: GlobalState = {
	workspaces: {},
	uiMetadata: { idSpecific: {} },
	settings: DEFAULT_SETTINGS,
	lastSaved: 0,
};

export const globalSlice = createSlice({
	name: 'global',
	initialState,
	reducers: {
		setWorkspaces: (state, action: PayloadAction<GlobalState['workspaces']>) => {
			state.workspaces = action.payload;
		},
		createWorkspace: (state, { payload }: PayloadUpdate<WorkspaceMetadata>) => {
			const newWorkspace = ItemFactory.workspace(payload);
			GlobalDataManager.createWorkspace(newWorkspace);
			state.workspaces[newWorkspace.id] = newWorkspace;
		},
		deleteWorkspace: (state, { payload }: PayloadAction<string>) => {
			const path = state.workspaces[payload]?.fileName;
			if (path == null) {
				throw new Error('cannot delete a workspace without a path');
			}
			GlobalDataManager.deleteWorkspace(path);
			if (path === state.activeWorkspace?.fileName) {
				state.activeWorkspace = undefined;
			}
			delete state.workspaces[payload];
		},
		updateWorkspace: (state, { payload }: PayloadUpdate<WorkspaceMetadata>) => {
			state.workspaces[payload.id] = { ...state.workspaces[payload.id], ...payload };
		},
		setSelectedWorkspace: (state, action: PayloadAction<WorkspaceMetadata | undefined>) => {
			const workspace = action.payload;
			state.activeWorkspace = workspace;
		},
		insertSettings: (state, action: PayloadAction<GlobalState['settings']>) => {
			GlobalDataManager.saveGlobalData({ ...state, settings: action.payload, lastSaved: new Date().getTime() });
		},
		setData: (state, { payload }: PayloadAction<GlobalData>) => {
			Object.assign(state, payload);
		},
	},
});

export const globalActions = globalSlice.actions;
