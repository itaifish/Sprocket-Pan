import { getMonacoInjectedTypeCode } from '@/managers/monaco/MonacoInitManager';
import { Script } from '@/types/data/workspace';
import { parseScript } from 'esprima';
import { Project, ScriptTarget, TypeFormatFlags, ts } from 'ts-morph';
import { timeout } from './misc';

/**
 * Call an async function with a maximum time limit (in milliseconds) for the timeout
 * @param asyncPromise An asynchronous promise to resolve
 * @param timeLimit Time limit to attempt function in milliseconds
 * @returns Resolved promise for async function call, or an error if time limit reached
 */
export function asyncCallWithTimeout<T>(asyncPromise: Promise<T>, timeLimit: number) {
	return Promise.race([timeout(timeLimit), asyncPromise]) as Promise<T>;
}

export async function evalAsync(codeToEval: string) {
	return Object.getPrototypeOf(async function () {}).constructor(codeToEval)();
}

export function getTypesFromCode(codeToEval: string, scripts: Script[]) {
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
}

export type VariableFromCode = {
	name: string;
	type: 'variable' | 'function' | 'class';
	typescriptTypeString: string;
};

export function getVariablesFromCode(codeToEval: string, scripts: Script[]): VariableFromCode[] {
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
	return variables;
}

type Replacer = (key: string, value: unknown) => unknown;

export function combineReplacers(replacers: Replacer[]): Replacer {
	return (key: string, value: unknown) => {
		replacers.forEach((replacer) => {
			value = replacer(key, value);
		});
		return value;
	};
}

export function nullifyProperties<T extends Record<string, any>>(...keys: (keyof T)[]): Replacer {
	return (key, value) => {
		if (keys.includes(key)) {
			return undefined;
		}
		return value;
	};
}

export function safeJsonParse<T>(str: string) {
	try {
		return [null, JSON.parse(str) as T] as const;
	} catch (err) {
		return [err, null] as const;
	}
}
