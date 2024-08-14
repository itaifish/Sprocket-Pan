import { Action, ThunkDispatch, createListenerMiddleware } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { setModifiedNow } from './slice';
import { log } from '../../utils/logging';

const isModifiedListener = createListenerMiddleware<RootState, ThunkDispatch<RootState, Action, Action>>();

const ignoreKeys = new Set([
	'workspaces/select/fulfilled',
	'workspaces/setWorkspaces',
	'workspaces/setSelectedWorkspace',
	'active/saveData/fulfilled',
	'active/saveData/pending',
	'active/setModifiedNow',
	'active/runScipt/fulfilled',
	'active/runScipt/pending',
]);

const ignoreNames = ['tabs'];

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
		if (ignoreKeys.has(action.type) || ignoreNames.some((x) => action.type.startsWith(x))) {
			return;
		}
		log.info(action.type);
		dispatch(setModifiedNow());
	},
});

// TODO: add listener to save and then construct redo/undo functionality?

export { isModifiedListener };
