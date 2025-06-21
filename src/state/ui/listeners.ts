import { Action, ThunkDispatch, createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { itemActions } from '../items';
import { uiActions } from './slice';

const openTabsListener = createListenerMiddleware<RootState, ThunkDispatch<RootState, Action, Action>>();

const allActions = Object.values(itemActions);
const isCreateAction = isAnyOf(...allActions.map((action) => action.create.fulfilled));

openTabsListener.startListening({
	matcher: isCreateAction,
	effect: ({ payload }, { dispatch }) => {
		dispatch(uiActions.addTab(payload));
		dispatch(uiActions.setSelectedTab(payload));
	},
});

export { openTabsListener };
