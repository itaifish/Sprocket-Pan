import { Monaco } from '@monaco-editor/react';
import { Script } from '../types/application-data/application-data';
import { editor } from 'monaco-editor';

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
	const classes = scripts.filter((script) => script.returnVariableType?.isClass);
	const type = `
	${classes.reduce(
		(runningClassTypeOutput, classType) => `
		${runningClassTypeOutput}
	${classType.returnVariableType?.typeText}`,
		'',
	)}
	type SprocketPan = {
		setEnvironmentVariable: (key: string, value: string, level?: 'request' | 'service' | 'global') => void;
		setQueryParam: (key: string, value: string) => void;
		setQueryParams: (key: string, values: string[]) => void;
		setHeader: (key: string, value: string) => void;
		getEnvironment: () => Record<string, string>;
		sendRequest: (requestId: string) => Promise<EndpointResponse>;
		readonly data: ApplicationData;
		readonly response: HistoricalEndpointResponse | null;
		readonly activeRequest: EndpointRequest<"none" | "form-data" | "x-www-form-urlencoded" | "raw">;
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
	const injectedCode = `
		type RawBodyType = 'Text' | 'JSON' | 'JavaScript' | 'HTML' | 'XML' | 'Yaml';
		type RequestBodyType = 'form-data' | 'x-www-form-urlencoded' | 'none' | 'raw';
		type EndpointRequest<TRequestBodyType extends RequestBodyType = RequestBodyType> = {
			id: string;
			endpointId: string;
			name: string;
			headers: Record<string, string>;
			queryParams: Record<string, string[]>;
			bodyType: TRequestBodyType;
			body: TRequestBodyType extends 'none'
				? undefined
				: TRequestBodyType extends 'raw'
				? string
				: TRequestBodyType extends 'form-data' | 'x-www-form-urlencoded'
				? Map<string, string>
				: Map<string, string> | string | undefined;
			rawType: TRequestBodyType extends 'raw'
				? RawBodyType
				: TRequestBodyType extends 'none' | 'form-data' | 'x-www-form-urlencoded'
				? undefined
				: RawBodyType | undefined;
			preRequestScript?: string;
			postRequestScript?: string;
			environmentOverride: Record<string, string>;
			history: HistoricalEndpointResponse[];
		};

		type RESTfulRequestVerb = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

		type NetworkFetchRequest = {
			method: RESTfulRequestVerb;
			url: string;
			headers: Record<string, string>;
			body: Record<string, unknown>;
		};

		type HistoricalEndpointResponse = {
			request: NetworkFetchRequest;
			response: EndpointResponse;
			dateTime: Date;
		};

		type Endpoint<TUrlBase extends string = string> = {
			id: string;
			url: string;
			verb: RESTfulRequestVerb;
			baseHeaders: Record<string, string>;
			baseQueryParams: Record<string, string[]>;
			preRequestScript?: string;
			postRequestScript?: string;
			name: string;
			description: string;
			serviceId: string;
			requestIds: string[];
			defaultRequest: string | null;
		};
		type Environment = {
			__name: string;
			__id: string;
			[key: string]: string;
		};
		type Service<TBaseUrl extends string = string> = {
			id: string;
			name: string;
			description: string;
			version: string;
			baseUrl: TBaseUrl;
			localEnvironments: {
				[environmentName: string]: Environment;
			};
			selectedEnvironment?: string;
			endpointIds: string[];
			preRequestScript?: string;
		};

		type ScriptRunnerStrategy =
			| ['request', 'service', 'endpoint']
			| ['request', 'endpoint', 'service']
			| ['service', 'request', 'endpoint']
			| ['service', 'endpoint', 'request']
			| ['endpoint', 'request', 'service']
			| ['endpoint', 'service', 'request'];

		type Settings = {
			debugLogs: boolean;
			zoomLevel: number;
			timeoutDurationMS: number;
			defaultTheme: 'light' | 'dark' | 'system-default';
			maxHistoryLength: number;
			displayVariableNames: boolean;
			scriptRunnerStrategy: {
				pre: ScriptRunnerStrategy;
				post: ScriptRunnerStrategy;
			};
		};

		type ApplicationData = {
			services: Record<string, Service>;
			endpoints: Record<string, Endpoint>;
			requests: Record<string, EndpointRequest>;
			environments: Record<string, Environment>;
			selectedEnvironment?: string;
			settings: Settings;
		};
		type EndpointResponse = {
			statusCode: number;
			body: string;
			bodyType: RawBodyType;
			headers: Record<string, string>;
		};

	${getSprocketPanType(scripts)}
	const sprocketPan = getScriptInjectionCode({} as any, {} as any, {} as any) as SprocketPan;
	const sp = sprocketPan;
			`;
	return injectedCode;
}

export function setMonacoInjectedTypeCode(monaco: Monaco, scripts: Script[] = []) {
	updateModelDefinition(monaco, getMonacoInjectedTypeCode(scripts));
}

export const defaultEditorOptions = {
	tabSize: 2,
	insertSpaces: false,
	wordWrap: 'on',
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
