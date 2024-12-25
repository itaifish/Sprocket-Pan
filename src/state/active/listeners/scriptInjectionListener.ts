import { ThunkDispatch, UnknownAction, createListenerMiddleware } from '@reduxjs/toolkit';
import { RootState } from '../../store';
import { log } from '@/utils/logging';
import { ScriptRunnerManager } from '@/managers/scripts/ScriptRunnerManager';

const scriptInjectionListener = createListenerMiddleware<
	RootState,
	ThunkDispatch<RootState, undefined, UnknownAction>
>();

scriptInjectionListener.startListening({
	predicate: (_, currentState, previousState) => {
		return currentState.active.scripts !== previousState.active.scripts;
	},
	effect: (_, stateAccess) => {
		log.info('middleware triggered script re-injection');
		ScriptRunnerManager.injectScripts(stateAccess);
	},
});

export { scriptInjectionListener };
