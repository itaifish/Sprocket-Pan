import ts from 'typescript';
import { Script } from '../types/application-data/application-data';
import { evalAsync } from '../utils/functions';

class ScriptRunnerManager {
	public static readonly INSTANCE = new ScriptRunnerManager();

	private constructor() {}

	public async runTypescriptContextless<TReturnType>(script: Script) {
		const jsScript = ts.transpile(script.content);
		const addendum = script.returnVariableName ? `\nreturn ${script.returnVariableName};` : '';
		const ranScript = await evalAsync(`${jsScript}${addendum}`);
		return ranScript as TReturnType;
	}
}

export const scriptRunnerManager = ScriptRunnerManager.INSTANCE;
