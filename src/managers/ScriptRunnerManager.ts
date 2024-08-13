import ts from 'typescript';
import { EndpointResponse, Script } from '../types/application-data/application-data';
import { asyncCallWithTimeout, evalAsync } from '../utils/functions';
import { StateAccess } from '../state/types';
import { AuditLog, RequestEvent, auditLogManager } from './AuditLogManager';
import { getScriptInjectionCode } from './ScriptInjectionManager';
import { log } from '../utils/logging';

class ScriptRunnerManager {
	public static readonly INSTANCE = new ScriptRunnerManager();

	private constructor() {}

	public async runTypescriptContextless<TReturnType>(script: Script) {
		const jsScript = ts.transpile(script.content);
		const addendum = script.returnVariableName ? `\nreturn ${script.returnVariableName};` : '';
		const ranScript = await evalAsync(`${jsScript}${addendum}`);
		return ranScript as TReturnType;
	}

	/**
	 * Dont' call this function directly
	 * Call the thunk `runScript` so you have the stateAccess context
	 */
	public async runTypescriptWithSprocketContext<TReturnType>(
		script: string | Script,
		requestId: string | null,
		stateAccess: StateAccess,
		response?: EndpointResponse | undefined,
		auditInfo?: {
			log: AuditLog;
			scriptType: Exclude<RequestEvent['eventType'], 'request'>;
			associatedId: string;
		},
	) {
		let scriptName = requestId == null ? 'Script' : `${response == undefined ? 'Pre' : 'Post'}-request Script`;
		scriptName = (script as Script)?.name ? `Script [${(script as Script)?.name}]` : scriptName;
		try {
			log.info(`Running ${scriptName}`);
			const runnableScript: Script =
				typeof script === 'string'
					? { scriptCallableName: '_', content: script, id: '', returnVariableName: null, name: 'wrapper' }
					: script;
			if (auditInfo) {
				auditLogManager.addToAuditLog(auditInfo.log, 'before', auditInfo.scriptType, auditInfo.associatedId);
			}
			const sprocketPan = getScriptInjectionCode(requestId, stateAccess, response, auditInfo?.log);
			const _this = globalThis as any;
			_this.sp = sprocketPan;
			_this.sprocketPan = sprocketPan;
			_this.fetch = fetch;
			const scriptTask = this.runTypescriptContextless<TReturnType>(runnableScript);
			const result = await asyncCallWithTimeout<TReturnType>(
				scriptTask,
				stateAccess.getState().settings.timeoutDurationMS,
			);
			if (auditInfo) {
				auditLogManager.addToAuditLog(auditInfo.log, 'after', auditInfo.scriptType, auditInfo.associatedId);
			}
			return result;
		} catch (e) {
			const errorStr = JSON.stringify(e, Object.getOwnPropertyNames(e));
			const returnError = {
				errorStr,
				errorType: `Invalid ${scriptName}`,
			};
			if (auditInfo) {
				auditLogManager.addToAuditLog(
					auditInfo.log,
					'after',
					auditInfo.scriptType,
					auditInfo.associatedId,
					JSON.stringify(returnError),
				);
			}
			log.warn(`Error when calling script ${scriptName}: \n${errorStr}`, 0);
			return { error: returnError };
		}
	}
}

export const scriptRunnerManager = ScriptRunnerManager.INSTANCE;
