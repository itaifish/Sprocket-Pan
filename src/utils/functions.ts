import { Environment, Script } from '../types/application-data/application-data';
import { Project, ScriptTarget, TypeFormatFlags, ts } from 'ts-morph';
import { getMonacoInjectedTypeCode } from '../managers/MonacoInitManager';
import { parseScript } from 'esprima';
import { log } from './logging';
import { EnvironmentUtils } from './data-utils';

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

export const getTypesFromCode = (codeToEval: string, scripts: Script[]) => {
	const project = new Project({
		useInMemoryFileSystem: true,
		compilerOptions: {
			target: ts.ScriptTarget.ES2023,
		},
	});
	const sourceFile = project.createSourceFile(
		'_evalCode.ts',
		`
	${getMonacoInjectedTypeCode(scripts)}
	${codeToEval}`,
	);
	const typeMap = new Map<string, string>();
	const variables = [...sourceFile.getVariableDeclarations(), ...sourceFile.getFunctions(), ...sourceFile.getClasses()];
	variables.forEach((variable) => {
		const type = variable.getType();
		const name = variable.getSymbol()?.getEscapedName();
		if (name) {
			if (variable.getKind() === ts.SyntaxKind.ClassDeclaration) {
				typeMap.set(name, variable.getText(true));
			} else {
				const typeString = type.getText(
					variable,
					TypeFormatFlags.None |
						TypeFormatFlags.NoTruncation |
						TypeFormatFlags.UseAliasDefinedOutsideCurrentScope |
						TypeFormatFlags.WriteArrayAsGenericType |
						TypeFormatFlags.WriteArrowStyleSignature |
						TypeFormatFlags.WriteClassExpressionAsTypeLiteral |
						TypeFormatFlags.UseStructuralFallback,
				);
				typeMap.set(name, typeString);
			}
		}
	});
	return typeMap;
};

export type VariableFromCode = {
	name: string;
	type: 'variable' | 'function' | 'class';
	typescriptTypeString: string;
};

export const getVariablesFromCode = (codeToEval: string, scripts: Script[]): Promise<VariableFromCode[]> => {
	return new Promise((resolve, _reject) => {
		try {
			const types = getTypesFromCode(codeToEval, scripts);
			let javascriptCode = ts.transpile(codeToEval, { target: ScriptTarget.ES2019 });
			javascriptCode = `async function topLevelAsync() {
			${javascriptCode}
		}`;
			const scriptProgram = parseScript(javascriptCode, { tolerant: true });
			const variables: VariableFromCode[] = [];
			if (scriptProgram.body[0].type === 'FunctionDeclaration') {
				scriptProgram.body[0].body.body.forEach((bodyElement) => {
					if (bodyElement.type === 'VariableDeclaration') {
						bodyElement.declarations.forEach((declaration) => {
							if (declaration.id.type == 'Identifier') {
								const typescriptType = types.get(declaration.id.name);
								if (typescriptType != undefined) {
									variables.push({ name: declaration.id.name, type: 'variable', typescriptTypeString: typescriptType });
								}
							}
						});
					} else if (bodyElement.type === 'FunctionDeclaration' || bodyElement.type === 'ClassDeclaration') {
						const typescriptType = types.get(bodyElement?.id?.name as string);
						if (bodyElement.id?.name != null && typescriptType != null) {
							variables.push({
								name: bodyElement.id.name,
								type: bodyElement.type === 'ClassDeclaration' ? 'class' : 'function',
								typescriptTypeString: typescriptType,
							});
						}
					}
				});
			}
			resolve(variables);
		} catch (e) {
			log.error(e);
			resolve([]);
		}
	});
};

type Replacer = (key: string, value: unknown) => unknown;

export function combineReplacers(replacers: Replacer[]): Replacer {
	return (key: string, value: unknown) => {
		replacers.forEach((replacer) => {
			value = replacer(key, value);
		});
		return value;
	};
}

export const noSettingsReplacer: Replacer = (key, value) => {
	if (key === 'settings') {
		return undefined;
	}
	return value;
};

export const noHistoryReplacer = (key: string, value: unknown) => {
	if (key === 'history') {
		return [];
	}
	return value;
};

const replaceAllEnvironmentValuesWithEmptyString = (environment: Environment) => {
	const copy = structuredClone(environment);
	for (const item of environment.__data) {
		EnvironmentUtils.set(copy, item.key, '');
	}
	return copy;
};

export const noEnvironmentsReplacer = (key: string, value: unknown) => {
	if (key === 'environments' || key === 'localEnvironments') {
		const record = value as Record<string, Environment>;
		return Object.values(record).reduce(
			(acc, curr) => {
				Object.assign(acc, { [curr.__id]: replaceAllEnvironmentValuesWithEmptyString(curr) });
				return acc;
			},
			{} as Record<string, Environment>,
		);
	}
	if (key === 'environmentOverride') {
		return replaceAllEnvironmentValuesWithEmptyString(value as Environment);
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
