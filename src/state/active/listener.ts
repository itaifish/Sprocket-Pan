import { Action, ThunkDispatch, createListenerMiddleware } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { setIsModified } from './slice';

const isModifiedListener = createListenerMiddleware<RootState, ThunkDispatch<RootState, Action, Action>>();

// TODO: determine if state has changed

isModifiedListener.startListening({
	predicate: (_, currentState, previousState) => {
		return !(previousState.active.isModified || currentState.active.isModified);
	},
	effect: (_, { dispatch }) => {
		// TODO: why is this not working?
		dispatch(setIsModified(true));
	},
});

// TODO: add listener to save and then construct redo/undo functionality?

export { isModifiedListener };
