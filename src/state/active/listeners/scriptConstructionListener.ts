import { ThunkDispatch, UnknownAction, createListenerMiddleware } from '@reduxjs/toolkit';
import { RootState } from '../../store';
import { log } from '@/utils/logging';
import { ScriptRunnerManager } from '@/managers/scripts/ScriptRunnerManager';

const scriptConstructionListener = createListenerMiddleware<
	RootState,
	ThunkDispatch<RootState, undefined, UnknownAction>
>();

scriptConstructionListener.startListening({
	predicate: (_, currentState, previousState) => {
		return currentState.active.scripts !== previousState.active.scripts;
	},
	effect: (_, stateAccess) => {
		log.info('middleware triggered user script reconstruction');
		ScriptRunnerManager.constructUserScripts(stateAccess);
	},
});

export { scriptConstructionListener };
