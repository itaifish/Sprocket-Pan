import { Script } from '@/types/data/workspace';
import { Monaco } from '@monaco-editor/react';
import { editor } from 'monaco-editor';
import { internalCodeText } from './SprocketInternalCode';

// this is hacky but how it has to be done because of
// https://github.com/microsoft/monaco-editor/issues/2696
// and more importanty
// https://github.com/microsoft/monaco-editor/pull/4544/files
// ^ when this PR is merged we can clean this up
let uriModelNumber = 0;
function updateModelDefinition(monaco: Monaco, injectedCode: string) {
	const filePath = `ts:sprocket/model${uriModelNumber}.ts`;
	const uri = monaco.Uri.parse(filePath);

	const toDispose = monaco.editor.getModels().find((x) => x.uri.toString() === uri.toString());
	if (toDispose) {
		toDispose?.dispose();
	}
	uriModelNumber++;
	const newFilePath = `ts:sprocket/model${uriModelNumber}.ts`;
	const newUri = monaco.Uri.parse(newFilePath);
	monaco.editor.createModel(injectedCode, 'typescript', newUri);
}

function getSprocketPanType(scripts: Script[]) {
	console.log('rerunning type');
	const classes = scripts.filter((script) => script.returnVariableType?.isClass);
	const type = `
	${classes.reduce(
		(runningClassTypeOutput, classType) => `
		${runningClassTypeOutput}
	${classType.returnVariableType?.typeText}`,
		'',
	)}
	${internalCodeText.substring(0, internalCodeText.length - 3)}
		${scripts.reduce(
			(runningScriptOutput, script) =>
				`${runningScriptOutput}
		${script.scriptCallableName}: () => Promise<${
			script.returnVariableType
				? script.returnVariableType.isClass
					? script.returnVariableName
					: script.returnVariableType.typeText
				: 'void'
		}>;`,
			'',
		)}
	}`;
	return type;
}

export function getMonacoInjectedTypeCode(scripts: Script[]) {
	return `${getSprocketPanType(scripts)}
	const sprocketPan = getScriptInjectionCode({} as any, {} as any, {} as any) as SprocketPan;
	const sp = sprocketPan;`;
}

export function setMonacoInjectedTypeCode(monaco: Monaco, scripts: Script[] = []) {
	updateModelDefinition(monaco, getMonacoInjectedTypeCode(scripts));
}

export const defaultEditorOptions = {
	tabSize: 2,
	insertSpaces: false,
	wordWrap: 'on',
	wrappingStrategy: 'simple',
	wrappingIndent: 'same',
} as const satisfies editor.IStandaloneEditorConstructionOptions;

export function initMonaco(monaco: Monaco) {
	monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
		noSemanticValidation: false,
		noSyntaxValidation: false,
	});
	monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
		diagnosticCodesToIgnore: [
			1375, //'await' expressions are only allowed at the top level of a file when that file is a module
			1378, //Top-level 'await' expressions are only allowed when the 'module' option is set to 'esnext' or 'system', and the 'target' option is set to 'es2017' or higher
		],
	});
	monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
		target: monaco.languages.typescript.ScriptTarget.ESNext,
		module: monaco.languages.typescript.ModuleKind.ESNext,
		allowNonTsExtensions: true,
		alwaysStrict: true,
		noUnusedParameters: true,
		noImplicitUseStrict: true,
		noUnusedLocals: true,
	});

	monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);
	monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);
	setMonacoInjectedTypeCode(monaco);
}
