import { ThunkDispatch, UnknownAction, createListenerMiddleware } from '@reduxjs/toolkit';
import { RootState } from '../../store';
import { log } from '@/utils/logging';
import { StateAccessManager } from '@/managers/data/StateAccessManager';

const stateAccessListener = createListenerMiddleware<RootState, ThunkDispatch<RootState, undefined, UnknownAction>>();

stateAccessListener.startListening({
	predicate: (_, currentState, previousState) => {
		return currentState.active.scripts !== previousState.active.scripts;
	},
	effect: (_, stateAccess) => {
		log.info('stateAccess refreshed');
		StateAccessManager.stateAccess = stateAccess;
	},
});

export { stateAccessListener };
