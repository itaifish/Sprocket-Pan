import { Action, ThunkDispatch, createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { activeActions, activeSlice } from './slice';

const isModifiedListener = createListenerMiddleware<RootState, ThunkDispatch<RootState, Action, Action>>();

const isIgnoredSliceAction = isAnyOf(
	activeActions.setModifiedNow,
	activeActions.setFullState,
	activeActions.setSavedNow,
);

isModifiedListener.startListening({
	predicate: (_, currentState, previousState) => {
		// we want lastModified to be updated in all cases where it hasn't been
		// & we _don't_ want to update lastModified when saving either
		// so, we should only update lastModified in cases where neither lastSaved nor lastModified were changed
		// (implying the update was elsewhere in the state)
		return (
			currentState.active.lastModified === previousState.active.lastModified &&
			currentState.active.lastSaved === previousState.active.lastSaved
		);
	},
	effect: (action, { dispatch }) => {
		if (isIgnoredSliceAction(action) || !action.type.startsWith(activeSlice.name)) {
			return;
		}
		console.log(`isModifiedListener triggered with ${action.type}`);
		dispatch(activeActions.setModifiedNow());
	},
});

// TODO: add listener to save and then construct redo/undo functionality?

export { isModifiedListener };
