import { createSelector } from '@reduxjs/toolkit';
import { uiSlice } from './slice';
import { getValidIdsFromSearchTerm } from '@/utils/search';
import { selectServices, selectEndpoints, selectRequests } from '../active/selectors';

export const selectUiState = uiSlice.selectSlice;

export const selectUiList = createSelector(selectUiState, (state) => state.list);

export const selectActiveTab = createSelector(selectUiState, (state) => state.selected);

export const selectPeekHistory = createSelector(selectUiState, ({ historyLocation, history }) => {
	const length = history.length;
	return {
		next: historyLocation === length - 1 ? null : historyLocation + 1,
		previous: historyLocation <= 0 ? null : historyLocation - 1,
	};
});

export const selectNextForDeletion = createSelector(selectUiState, ({ deleteQueue }) => {
	return deleteQueue[0];
});

export const selectNextForCreation = createSelector(selectUiState, ({ createQueue }) => {
	return createQueue[0];
});

export const selectNextForDiff = createSelector(selectUiState, ({ diffQueue }) => {
	return diffQueue[0];
});

export const selectSearchText = createSelector(selectUiState, (state) => state.searchText);

export const selectFilteredIds = createSelector(
	[selectSearchText, selectServices, selectEndpoints, selectRequests],
	(searchText, services, endpoints, requests) =>
		searchText === '' ? null : getValidIdsFromSearchTerm(searchText, { services, endpoints, requests }),
);

export const selectFilteredNestedIds = createSelector(
	[selectFilteredIds, (_, nestedIds: string[]) => nestedIds],
	(filteredIds, nestedIds) => (filteredIds == null ? nestedIds : nestedIds.filter(filteredIds.has.bind(filteredIds))),
);

export const selectIsActiveTab = createSelector(
	[selectActiveTab, (_, id: string) => id],
	(activeTab, id) => activeTab === id,
);

export const selectOrphans = createSelector(selectUiState, (state) => state.orphans);

export const selectToast = createSelector(selectUiState, (state) => state.toast);
