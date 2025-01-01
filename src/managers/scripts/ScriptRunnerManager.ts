import { Script } from '@/types/data/workspace';
import { log } from '@/utils/logging';
import ts from 'typescript';
import { auditLogManager } from '../AuditLogManager';
import { getSettingsFromState } from '@/utils/application';
import { OptionalScriptContext } from './types';
import { runContextfulInterruptibleScript } from '@/utils/functions';
import { SprocketScriptContext } from './SprocketScriptContext';
import { errorToSprocketError } from '@/utils/conversion';
import { StateAccessManager } from '../data/StateAccessManager';
import { constructRunnableScript } from './scripts';

export interface RunTypescriptWithFullContextArgs extends Omit<OptionalScriptContext, 'name'> {
	script: string | Script;
}

export class ScriptRunnerManager {
	public static runTypescript<T>(sp: SprocketScriptContext, script: string, timeout?: number) {
		log.info(`Running ${sp.context.name}`);
		auditLogManager.addToAuditLogFromContext(sp.context, 'before');
		const transpiled = ts.transpile(script);
		const { result, interrupt } = runContextfulInterruptibleScript<T>(transpiled, sp, timeout);
		return {
			result: result
				.catch((err) => {
					const sprocketErr = errorToSprocketError(err, sp.context);
					auditLogManager.addToAuditLogFromContext(sp.context, 'after', JSON.stringify(sprocketErr));
					log.warn(`Error when calling script ${sp.context.name}: ${sprocketErr.message}`);
					interrupt('error thrown');
					throw sprocketErr;
				})
				.then((res) => {
					auditLogManager.addToAuditLogFromContext(sp.context, 'after');
					return res;
				}),
			interrupt,
		};
	}

	public static runTypescriptWithFullContext<TReturnType>({ script, ...context }: RunTypescriptWithFullContextArgs) {
		const stateAccess = StateAccessManager.stateAccess;
		if (stateAccess == null) throw new Error('State access not available on script run! This is a SprocketPan bug.');
		const state = stateAccess.getState();
		const { runnable, name } = constructRunnableScript(script, Object.values(state.active.scripts), context);
		return this.runTypescript<TReturnType>(
			new SprocketScriptContext({ ...context, name }),
			runnable,
			getSettingsFromState(stateAccess.getState()).script.timeoutMS,
		);
	}
}
