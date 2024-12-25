import { Script, EndpointResponse } from '@/types/data/workspace';
import { log } from '@/utils/logging';
import ts from 'typescript';
import { auditLogManager } from '../AuditLogManager';
import { getSettingsFromState } from '@/utils/application';
import { StateAccess } from '@/state/types';
import { OptionalScriptContext, RunTypeScriptReturn } from './types';
import { getRunnableScripts, RunnableScript } from './scripts';
import { runContextfulInterruptableScript } from '@/utils/functions';
import { SprocketScriptContext } from './SprocketScriptContext';

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
}

export class ScriptRunnerManager {
	public static userScripts: Record<string, RunnableScript> = {};
	private static stateAccess: StateAccess | null = null;

	public static runTypescript<T>(sp: SprocketScriptContext, script: Script, timeout?: number): RunTypeScriptReturn<T> {
		log.info(`Running ${sp.context.name}`);
		auditLogManager.addToAuditLogFromContext(sp.context, 'before');
		const jsScript = ts.transpile(script.content);
		const addendum = script.returnVariableName ? `\nreturn ${script.returnVariableName};` : '';
		const { result, interrupt } = runContextfulInterruptableScript<T>(`${jsScript}${addendum}`, sp, timeout);
		return {
			result: result.then((res) => {
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
		const { result, interrupt } = this.runTypescript<TReturnType>(
			new SprocketScriptContext(stateAccess, this.userScripts, { ...context, name }),
			runnable,
			getSettingsFromState(stateAccess.getState()).script.timeoutMS,
		);
		return {
			result: result.catch((e) => {
				const errorStr = JSON.stringify(e, Object.getOwnPropertyNames(e));
				const returnError = {
					errorStr,
					errorType: `Invalid ${name}`,
				};
				auditLogManager.addToAuditLogFromContext(context, 'after', JSON.stringify(returnError));
				log.warn(`Error when calling script ${name}: \n${errorStr}`, 0);
				return { error: returnError };
			}),
			interrupt,
		};
	}
}
