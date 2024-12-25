import { WorkspaceData } from '@/types/data/workspace';
import { ScriptRunnerManager } from './ScriptRunnerManager';
import { SprocketScriptContext } from './SprocketScriptContext';

export type RunnableScript = (
	sp: SprocketScriptContext,
) => ReturnType<typeof ScriptRunnerManager.runTypescript<unknown>>;

export function getRunnableScripts(data: WorkspaceData) {
	const scripts: Record<string, RunnableScript> = {};
	for (const key in data.scripts) {
		const script = data.scripts[key];
		scripts[script.scriptCallableName] = (sp) => ScriptRunnerManager.runTypescript(sp, script);
	}
	return scripts;
}
