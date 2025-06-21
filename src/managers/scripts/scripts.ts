import { Script } from '@/types/data/workspace';
import { OptionalScriptContext } from './types';

export function getWrappedScript({ scriptCallableName, content }: Script) {
	return `async function ${scriptCallableName}() {
			${content}
		}`;
}

export function getScriptsAsCode(scripts: Script[]) {
	return scripts.map(getWrappedScript).join('\n');
}

export function constructRunnableScript(script: string | Script, scripts: Script[], context?: OptionalScriptContext) {
	let runnable: string;
	let name: string;
	const injectedCode = getScriptsAsCode(scripts);
	if (typeof script === 'string') {
		runnable = `${injectedCode}\n${script}`;
		name = context?.requestId == null ? 'Script' : `${context?.response == undefined ? 'Pre' : 'Post'}-request Script`;
	} else {
		runnable = `${injectedCode}\nreturn await ${script.scriptCallableName}();`;
		name = `Script [${script.name}]`;
	}
	return { name, runnable };
}
