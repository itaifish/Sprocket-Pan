import { Monaco } from '@monaco-editor/react';
import { Script } from '../types/application-data/application-data';
import { log } from '../utils/logging';

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
	log.info(type);
	return type;
}

export function setMonacoInjectedTypeCode(monaco: Monaco, scripts: Script[] = []) {
	const injectedCode = `
		type EndpointRequest<TRequestBodyType extends RequestBodyType = RequestBodyType> = {
			id: string;
			endpointId: string;
			name: string;
			headers: Record<string, string>;
			queryParams: Record<string, string[]>;
			bodyType: TRequestBodyType;
			body: TRequestBodyType extends 'none' ? undefined : TRequestBodyType extends 'raw' ? string : TRequestBodyType extends 'form-data' | 'x-www-form-urlencoded' ? Map<string, string> : Map<string, string> | string | undefined;
			rawType: TRequestBodyType extends 'raw' ? RawBodyType : TRequestBodyType extends 'none' | 'form-data' | 'x-www-form-urlencoded' ? undefined : RawBodyType | undefined;
			preRequestScript?: string;
			postRequestScript?: string;
			environmentOverride: Record<string, string>;
			history: HistoricalEndpointResponse[];
		};

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
	log.info('Updating monaco code');
	monaco.languages.typescript.typescriptDefaults.setExtraLibs([
		{
			content: injectedCode,
		},
	]);
}

export const defaultEditorOptions = {
	tabSize: 2,
	insertSpaces: false,
	wordWrap: 'bounded',
	wrappingIndent: 'same',
	wordWrapColumn: 9999,
} as const;

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
