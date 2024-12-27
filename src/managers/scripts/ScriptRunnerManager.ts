import { Script, EndpointResponse } from '@/types/data/workspace';
import { log } from '@/utils/logging';
import ts from 'typescript';
import { auditLogManager } from '../AuditLogManager';
import { getSettingsFromState } from '@/utils/application';
import { StateAccess } from '@/state/types';
import { OptionalScriptContext } from './types';
import { getRunnableScripts, RunnableScript } from './scripts';
import { runContextfulInterruptibleScript } from '@/utils/functions';
import { SprocketScriptContext } from './SprocketScriptContext';
import { errorToSprocketError } from '@/utils/conversion';

function constructRunnableScript(script: string | Script, requestId?: string, response?: EndpointResponse) {
	let name = requestId == null ? 'Script' : `${response == undefined ? 'Pre' : 'Post'}-request Script`;
	name = (script as Script)?.name ? `Script [${(script as Script)?.name}]` : name;
	const runnable: Script =
		typeof script === 'string'
			? { scriptCallableName: '_', content: script, id: '', returnVariable: null, name: 'wrapper' }
			: script;
	return { runnable, name };
}

export interface RunTypescriptWithFullContextArgs extends Omit<OptionalScriptContext, 'name'> {
	script: string | Script;
}

export class ScriptRunnerManager {
	public static userScripts: Record<string, RunnableScript> = {};
	private static stateAccess: StateAccess | null = null;

	public static runTypescript<T>(sp: SprocketScriptContext, script: Script, timeout?: number) {
		log.info(`Running ${sp.context.name}`);
		auditLogManager.addToAuditLogFromContext(sp.context, 'before');
		const jsScript = ts.transpile(script.content);
		const addendum = script.returnVariable ? `\nreturn ${script.returnVariable.name};` : '';
		const { result, interrupt } = runContextfulInterruptibleScript<T>(`${jsScript}${addendum}`, sp, timeout);
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

	public static constructUserScripts(stateAccess: StateAccess) {
		this.stateAccess = stateAccess;
		this.userScripts = getRunnableScripts(stateAccess.getState().active);
	}

	public static runTypescriptWithFullContext<TReturnType>({ script, ...context }: RunTypescriptWithFullContextArgs) {
		const stateAccess = this.stateAccess;
		if (stateAccess == null) throw new Error('State access not available on script run! This is a SprocketPan bug.');
		const { runnable, name } = constructRunnableScript(script, context.requestId, context.response);
		return this.runTypescript<TReturnType>(
			new SprocketScriptContext(stateAccess, this.userScripts, { ...context, name }),
			runnable,
			getSettingsFromState(stateAccess.getState()).script.timeoutMS,
		);
	}
}
