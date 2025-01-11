import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { TabType } from '../../types/state/state';
import { log } from '../../utils/logging';
import { SelectedResponse } from '../../components/root/overlays/ResponseDiffOverlay/ResponseSelectForm';
import { OrphanData } from '@/managers/data/WorkspaceDataManager';
import { ToastProps } from '@/components/root/Toasts';

export type DiffQueueEntry = { original: SelectedResponse; modified: SelectedResponse };

export interface UiState {
	selectedTab: string | null;
	tabs: string[];
	tabsHistory: string[];
	tabsHistoryPosition: number;
	deleteQueue: string[];
	diffQueue: DiffQueueEntry[];
	createQueue: TabType[];
	searchText: string;
	orphans: OrphanData | null;
	toast?: ToastProps;
}

const initialState: UiState = {
	tabs: [],
	tabsHistory: [],
	tabsHistoryPosition: 0,
	selectedTab: null,
	deleteQueue: [],
	createQueue: [],
	diffQueue: [],
	searchText: '',
	orphans: null,
};

function closeTab(state: UiState, { payload }: PayloadAction<string>) {
	state.tabs = state.tabs.filter((id) => id !== payload);
	if (payload === state.selectedTab) state.selectedTab = state.tabs.at(-1) ?? null;
}

export const uiSlice = createSlice({
	name: 'ui',
	initialState,
	reducers: {
		closeTab,
		addToDiffQueue: (state, { payload }: PayloadAction<SelectedResponse | DiffQueueEntry>) => {
			if ('original' in payload) {
				state.diffQueue.push(payload);
			} else {
				state.diffQueue.push({ original: payload, modified: payload });
			}
		},
		addToDeleteQueue: (state, { payload }: PayloadAction<string>) => {
			state.deleteQueue.push(payload);
		},
		addToCreateQueue: (state, { payload }: PayloadAction<TabType>) => {
			state.createQueue.push(payload);
		},
		removeFromDeleteQueue: (state, { payload }: PayloadAction<string>) => {
			state.deleteQueue.splice(
				state.deleteQueue.findIndex((id) => id === payload),
				1,
			);
		},
		removeFromCreateQueue: (state, { payload }: PayloadAction<TabType>) => {
			state.createQueue.splice(
				state.createQueue.findIndex((id) => id === payload),
				1,
			);
		},
		popDiffQueue: (state) => {
			state.diffQueue.pop();
		},
		setSearchText: (state, { payload }: PayloadAction<string>) => {
			state.searchText = payload;
		},
		addTabs: (state, action: PayloadAction<UiState['tabs']>) => {
			state.tabs = { ...state.tabs, ...action.payload };
		},
		addTab: (state, { payload }: PayloadAction<string>) => {
			if (!state.tabs.includes(payload)) {
				state.tabs.push(payload);
			}
		},
		setSelectedTab: (state, { payload }: PayloadAction<string>) => {
			state.selectedTab = payload;
			if (payload !== state.tabsHistory[state.tabsHistoryPosition]) {
				state.tabsHistory.splice(state.tabsHistoryPosition + 1, Infinity, payload);
				log.trace(`Selecting ${payload} tab`, 1);
				state.tabsHistoryPosition = state.tabsHistory.length - 1;
			}
		},
		clearTabs: (state) => {
			state.tabs = [];
			state.tabsHistory = [];
			state.tabsHistoryPosition = 0;
		},
		setSelectedTabFromHistory: (state, { payload }: PayloadAction<number | null>) => {
			if (payload != null) {
				const id = state.tabsHistory[payload];
				if (id != undefined) {
					state.tabs.push(id);
					state.selectedTab = id;
					state.tabsHistoryPosition = payload;
				}
			}
		},
		setOrphans: (state, { payload }: PayloadAction<UiState['orphans']>) => {
			state.orphans = payload;
		},
		toast: (state, { payload }: PayloadAction<ToastProps>) => {
			state.toast = payload;
		},
		reset: () => initialState,
	},
});

export const uiActions = uiSlice.actions;
