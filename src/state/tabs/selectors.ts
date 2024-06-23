import { createSelector } from '@reduxjs/toolkit';
import { tabsSlice } from './slice';

export const selectTabsState = tabsSlice.selectSlice;

export const selectTabsList = createSelector(selectTabsState, (state) => state.list);

export const selectActiveTab = createSelector(selectTabsState, (state) => state.selected);

export const selectPeekHistory = createSelector(selectTabsState, ({ historyLocation, history }) => {
	const length = history.length;
	return {
		next: historyLocation === length - 1 ? null : historyLocation + 1,
		previous: historyLocation <= 0 ? null : historyLocation - 1,
	};
});
