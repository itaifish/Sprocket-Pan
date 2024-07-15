import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { TabType } from '../../types/state/state';
import { ResponseDiffSelection } from '../../components/root/overlays/ResponseDiffOverlay/ResponseDiffOverlay';

export interface TabsState {
	selected: string | null;
	list: Record<string, TabType>;
	history: any;
	historyLocation: number;
	deleteQueue: string[];
	diffQueue: ResponseDiffSelection[];
	createQueue: TabType[];
	searchText: string;
}

const initialState: TabsState = {
	list: {},
	history: [],
	historyLocation: 0,
	selected: null,
	deleteQueue: [],
	createQueue: [],
	diffQueue: [],
	searchText: '',
};

export const tabsSlice = createSlice({
	name: 'tabs',
	initialState,
	reducers: {
		addToDiffQueue: (state, { payload }: PayloadAction<ResponseDiffSelection>) => {
			state.diffQueue.push(payload);
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
		popDiffQueue: (state, { payload }: PayloadAction<void>) => {
			state.diffQueue.pop();
		},
		setSearchText: (state, { payload }: PayloadAction<string>) => {
			state.searchText = payload;
		},
		addTabs: (state, action: PayloadAction<TabsState['list']>) => {
			state.list = { ...state.list, ...action.payload };
		},
		closeTab: (state, action: PayloadAction<string>) => {
			delete state.list[action.payload];
			if (action.payload === state.selected) {
				state.selected = Object.keys(state.list).at(-1) ?? null;
			}
		},
		setSelectedTab: (state, { payload }: PayloadAction<string>) => {
			state.selected = payload;
			if (payload !== state.history[state.historyLocation]?.id) {
				state.history.splice(state.historyLocation + 1, Infinity, {
					type: state.list[payload],
					id: payload,
				});
				state.historyLocation = state.history.length - 1;
			}
		},
		setSelectedTabFromHistory: (state, { payload }: PayloadAction<number | null>) => {
			if (payload != null) {
				const tabData = state.history[payload];
				if (tabData != undefined) {
					state.list = { ...state.list, [tabData.id]: tabData.type };
					state.selected = tabData.id;
					state.historyLocation = payload;
				}
			}
		},
	},
});

export const {
	setSearchText,
	addToDeleteQueue,
	removeFromDeleteQueue,
	addToCreateQueue,
	removeFromCreateQueue,
	addToDiffQueue,
	popDiffQueue,
	setSelectedTab,
	addTabs,
	closeTab,
	setSelectedTabFromHistory,
} = tabsSlice.actions;
