import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { TabType } from '../../types/state/state';

export interface TabsState {
	selected?: string;
	list: Record<string, TabType>;
	history: any;
	historyLocation: number;
}

const initialState: TabsState = {
	list: {},
	history: [],
	historyLocation: 0,
};

export const tabsSlice = createSlice({
	name: 'tabs',
	initialState,
	reducers: {
		addTabs: (state, action: PayloadAction<TabsState['list']>) => {
			state.list = { ...state.list, ...action.payload };
		},
		closeTab: (state, action: PayloadAction<string>) => {
			delete state.list[action.payload];
			if (action.payload === state.selected) {
				state.selected = Object.keys(state.list).at(-1);
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

export const { setSelectedTab, addTabs, closeTab, setSelectedTabFromHistory } = tabsSlice.actions;
