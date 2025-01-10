import { Action, ThunkDispatch, createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { itemActions } from '../items';
import { uiActions } from './slice';
import { getDescendents } from '@/utils/getters';

const closeTabsListener = createListenerMiddleware<RootState, ThunkDispatch<RootState, Action, Action>>();
const openTabsListener = createListenerMiddleware<RootState, ThunkDispatch<RootState, Action, Action>>();

const allActions = Object.values(itemActions);
const isDeleteAction = isAnyOf(...allActions.map((action) => action.delete));
const isCreateAction = isAnyOf(...allActions.map((action) => action.create.fulfilled));

closeTabsListener.startListening({
	matcher: isDeleteAction,
	effect: ({ payload }, { dispatch, getState }) => {
		const state = getState();
		getDescendents({ ...state.active, ...state.global }, payload).forEach((id) => dispatch(uiActions.closeTab(id)));
	},
});

openTabsListener.startListening({
	matcher: isCreateAction,
	effect: ({ payload }, { dispatch }) => {
		dispatch(uiActions.addTab(payload));
		dispatch(uiActions.setSelectedTab(payload));
	},
});

export { closeTabsListener, openTabsListener };
