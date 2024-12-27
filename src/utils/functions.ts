import { getMonacoInjectedTypeCode } from '@/managers/monaco/MonacoInitManager';
import { Script, VariableFromCode } from '@/types/data/workspace';
import { parseScript } from 'esprima';
import { Project, ScriptTarget, TypeFormatFlags, ts } from 'ts-morph';
import { getClearableTimeout, interruptingTimeout } from './misc';
import { InterruptibleScriptReturn } from './types';
import { Token } from '@/types/shared/misc';
import { SprocketScriptContext } from '@/managers/scripts/SprocketScriptContext';

/**
 * Call an async function with a maximum time limit (in milliseconds) for the timeout
 * @param asyncPromise An asynchronous promise to resolve
 * @param timeLimit Time limit to attempt function in milliseconds
 * @returns Resolved promise for async function call, or rejected if time limit reached
 */
export function asyncCallWithTimeout<T>(asyncPromise: Promise<T>, timeLimit: number) {
	return Promise.race([getClearableTimeout(timeLimit).promise, asyncPromise]) as Promise<T>;
}

export function runContextfulInterruptibleScript<T>(
	script: string,
	sp: SprocketScriptContext,
	timeout?: number,
): InterruptibleScriptReturn<T> {
	const result = Object.getPrototypeOf(async () => {}).constructor('sp', script)(sp);
	return { result: interruptingTimeout(result, sp.interrupt, timeout), interrupt: sp.interrupt };
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
							variables.push({ name: declaration.id.name, type: 'variable', typeText: typescriptType });
						}
					}
				});
			} else if (bodyElement.type === 'FunctionDeclaration' || bodyElement.type === 'ClassDeclaration') {
				const typescriptType = types.get(bodyElement?.id?.name as string);
				if (bodyElement.id?.name != null && typescriptType != null) {
					variables.push({
						name: bodyElement.id.name,
						type: bodyElement.type === 'ClassDeclaration' ? 'class' : 'function',
						typeText: typescriptType,
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

export function checkInterrupt<T, A extends any[]>(func: (...args: A) => T, token: Token<boolean>) {
	return (...args: A) => {
		if (token.current) {
			throw new Error(`operation interrupted, reason: ${token.comment}`);
		}
		return func(...args);
	};
}
