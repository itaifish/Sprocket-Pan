import { Script, EndpointResponse } from '@/types/data/workspace';
import { log } from '@/utils/logging';
import ts from 'typescript';
import { auditLogManager } from '../AuditLogManager';
import { getSettingsFromState } from '@/utils/application';
import { StateAccess } from '@/state/types';
import { OptionalScriptContext, RunTypeScriptReturn } from './types';
import { getSprocketScripts, getUserScripts } from './scripts';

function constructRunnableScript(script: string | Script, requestId?: string, response?: EndpointResponse) {
	let name = requestId == null ? 'Script' : `${response == undefined ? 'Pre' : 'Post'}-request Script`;
	name = (script as Script)?.name ? `Script [${(script as Script)?.name}]` : name;
	const runnable: Script =
		typeof script === 'string'
			? { scriptCallableName: '_', content: script, id: '', returnVariableName: null, name: 'wrapper' }
			: script;
	return { runnable, name };
}

export interface RunTypescriptWithFullContextArgs extends Omit<OptionalScriptContext, 'name'> {
	script: string | Script;
	stateAccess: StateAccess;
}

export class ScriptRunnerManager {
	public static runTypescript<T>(
		context: OptionalScriptContext,
		script: Script,
		timeout?: number,
	): RunTypeScriptReturn<T> {
		log.info(`Running ${context.name}`);
		auditLogManager.addToAuditLogFromContext(context, 'before');
		const jsScript = ts.transpile(script.content);
		const addendum = script.returnVariableName ? `\nreturn ${script.returnVariableName};` : '';
		const interruptable = constructInterruptableScript<T>(`${jsScript}${addendum}`, timeout);
		const result = interruptable.run(context).then((res) => {
			auditLogManager.addToAuditLogFromContext(context, 'after');
			return res;
		});
		return { result, interrupt: interruptable.interrupt };
	}

	public static injectScripts(stateAccess: StateAccess) {
		const global = globalThis as any;
		global.sprocketScripts = getSprocketScripts(stateAccess);
		global.userScripts = getUserScripts(stateAccess);
	}

	public static async runTypescriptWithFullContext<TReturnType>({
		script,
		stateAccess,
		...context
	}: RunTypescriptWithFullContextArgs) {
		const { runnable, name } = constructRunnableScript(script, context.requestId, context.response);
		try {
			return this.runTypescript<TReturnType>(
				{ ...context, name },
				runnable,
				getSettingsFromState(stateAccess.getState()).request.timeoutMS,
			);
		} catch (e) {
			const errorStr = JSON.stringify(e, Object.getOwnPropertyNames(e));
			const returnError = {
				errorStr,
				errorType: `Invalid ${name}`,
			};
			auditLogManager.addToAuditLogFromContext(context, 'after', JSON.stringify(returnError));
			log.warn(`Error when calling script ${name}: \n${errorStr}`, 0);
			return { error: returnError };
		}
	}
}
