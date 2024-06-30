import { Environment } from '../types/application-data/application-data';
import { parseScript } from 'esprima';
/**
 * Call an async function with a maximum time limit (in milliseconds) for the timeout
 * @param asyncPromise An asynchronous promise to resolve
 * @param timeLimit Time limit to attempt function in milliseconds
 * @returns Resolved promise for async function call, or an error if time limit reached
 */
export const asyncCallWithTimeout = async <T>(asyncPromise: Promise<T>, timeLimit: number) => {
	let timeoutHandle: NodeJS.Timeout;

	const timeoutPromise = new Promise((_resolve, reject) => {
		timeoutHandle = setTimeout(
			() => reject(new Error(`Call Timeout Limit (${timeLimit / 1_000}s) Reached`)),
			timeLimit,
		);
	});

	return Promise.race([asyncPromise, timeoutPromise]).then((result) => {
		clearTimeout(timeoutHandle);
		return result as T;
	});
};

export const evalAsync = async (codeToEval: string) => {
	return Object.getPrototypeOf(async function () {}).constructor(codeToEval)();
};

export const getVariablesFromCode = (codeToEval: string) => {
	try {
		const scriptProgram = parseScript(codeToEval);
		const variables: { name: string; type: 'variable' | 'function' | 'class' }[] = [];
		scriptProgram.body.forEach((bodyElement) => {
			if (bodyElement.type === 'VariableDeclaration') {
				bodyElement.declarations.forEach((declaration) => {
					if (declaration.id.type == 'Identifier') {
						variables.push({ name: declaration.id.name, type: 'variable' });
					}
				});
			} else if (bodyElement.type === 'FunctionDeclaration' || bodyElement.type === 'ClassDeclaration') {
				if (bodyElement.id?.name != null) {
					variables.push({
						name: bodyElement.id.name,
						type: bodyElement.type === 'ClassDeclaration' ? 'class' : 'function',
					});
				}
			}
		});
		return variables;
	} catch (e) {
		return [];
	}
};

export const noHistoryAndMetadataReplacer = (key: string, value: unknown) => {
	if (key === 'history') {
		return [];
	}
	if (key === 'workspaceMetadata') {
		return undefined;
	}
	return value;
};

export const getDataArrayFromEnvKeys = (env: Environment) => {
	return Object.keys(env)
		.filter((envKey) => !envKey.startsWith('__'))
		.map((envKey) => ({ key: envKey, value: env[envKey] }));
};

export function safeJsonParse<T>(str: string) {
	try {
		return [null, JSON.parse(str) as T] as const;
	} catch (err) {
		return [err, null] as const;
	}
}
