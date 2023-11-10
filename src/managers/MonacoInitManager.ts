import { Monaco } from '@monaco-editor/react';

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
		type HistoricalEndpointResponse = {
				request: Omit<EndpointRequest, 'history'>;
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

		type SprocketPan = {
				setEnvironmentVariable: (key: string, value: string, level?: 'request' | 'service' | 'global') => void;
				setQueryParam: (key: string, value: string) => void;
				setQueryParams: (key: string, values: string[]) => void;
				setHeader: (key: string, value: string) => void;
				sendRequest: (requestId: string) => Promise<EndpointResponse>;
				getEnvironment: () => Record<string, string>;
				data: ApplicationData;
				response: HistoricalEndpointResponse | null;
		}
		const sprocketPan = getScriptInjectionCode({} as any, {} as any, {} as any) as SprocketPan;
		const sp = sprocketPan;
			`;
	monaco.languages.typescript.typescriptDefaults.addExtraLib(injectedCode, 'ts:types/types.d.ts');
}
