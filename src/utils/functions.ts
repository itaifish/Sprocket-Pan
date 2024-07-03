import { Environment, Script } from '../types/application-data/application-data';
import { parseScript } from 'esprima';
import { log } from './logging';
import { ScriptTarget } from 'typescript';
import { Project, TypeFormatFlags, ts } from 'ts-morph';
import { getMonacoInjectedTypeCode } from '../managers/MonacoInitManager';

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

type VariablesFromCode = Array<{
	name: string;
	type: 'variable' | 'function' | 'class';
	typescriptTypeString: string;
}>;

export const getVariablesFromCode = (codeToEval: string, scripts: Script[]): VariablesFromCode => {
	try {
		const types = getTypesFromCode(codeToEval, scripts);
		let javascriptCode = ts.transpile(codeToEval, { target: ScriptTarget.ES2019 });
		javascriptCode = `async function topLevelAsync() {
			${javascriptCode}
		}`;
		const scriptProgram = parseScript(javascriptCode, { tolerant: true });
		const variables: VariablesFromCode = [];
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
		return variables;
	} catch (e) {
		log.error(e);
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
