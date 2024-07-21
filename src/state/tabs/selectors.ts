import { createSelector } from '@reduxjs/toolkit';
import { tabsSlice } from './slice';
import { selectEndpoints, selectEnvironments, selectRequests, selectServices } from '../active/selectors';
import { getValidIdsFromSearchTerm } from '../../utils/search';

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

export const selectNextForDeletion = createSelector(selectTabsState, ({ deleteQueue }) => {
	return deleteQueue[0];
});

export const selectNextForCreation = createSelector(selectTabsState, ({ createQueue }) => {
	return createQueue[0];
});

export const selectNextForDiff = createSelector(selectTabsState, ({ diffQueue }) => {
	return diffQueue[0];
});

export const selectSearchText = createSelector(selectTabsState, (state) => state.searchText);

export const selectFilteredIds = createSelector(
	[selectSearchText, selectEnvironments, selectServices, selectEndpoints, selectRequests],
	(searchText, environments, services, endpoints, requests) =>
		searchText === '' ? null : getValidIdsFromSearchTerm(searchText, { environments, services, endpoints, requests }),
);

export const selectFilteredNestedIds = createSelector(
	[selectFilteredIds, (_, nestedIds: string[]) => nestedIds],
	(filteredIds, nestedIds) => (filteredIds == null ? nestedIds : nestedIds.filter(filteredIds.has.bind(filteredIds))),
);

export const selectIsActiveTab = createSelector(
	[selectActiveTab, (_, id: string) => id],
	(activeTab, id) => activeTab === id,
);
