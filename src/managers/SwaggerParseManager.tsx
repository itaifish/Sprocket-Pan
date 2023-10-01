import { Endpoint, RESTfulRequestVerb, RESTfulRequestVerbs, Service } from '../types/application-data/application-data';
import { log } from '../utils/logging';
import { OpenAPI, OpenAPIV2, OpenAPIV3 } from 'openapi-types';
import { polyfill } from '../utils/pollyfill';

class SwaggerParseManager {
	public static readonly INSTANCE = new SwaggerParseManager();
	private parser: any | undefined;
	private constructor() {
		polyfill().then(async () => {
			const SwaggerParserConstructor = (await import('@apidevtools/swagger-parser')).default;
			this.parser = new SwaggerParserConstructor();
		});
	}

	public async parseSwaggerFile(inputType: 'fileContents' | 'filePath', inputValue: string): Promise<Service> {
		try {
			const input = inputType === 'fileContents' ? JSON.parse(inputValue) : inputValue;
			const api: OpenAPI.Document | undefined = await this.parser?.dereference(input);
			if (!api) {
				throw new Error('Waiting on parser to load');
			}
			return this.mapApiToService(api);
		} catch (e) {
			log.error(e);
			return Promise.reject(e);
		}
	}

	private mapApiToService(swaggerApi: OpenAPI.Document): Service {
		const version =
			(swaggerApi as OpenAPIV2.Document).swagger != null
				? '2'
				: (swaggerApi as OpenAPIV3.Document).openapi.charAt(3) === '0'
				? '3'
				: '3.1';
		return {
			name: swaggerApi?.info?.title ?? 'New Service',
			version: swaggerApi?.info?.version ?? '1.0.0',
			description: swaggerApi?.info?.description ?? '',
			baseUrl: swaggerApi?.externalDocs?.url ?? '',
			localEnvironments: {},
			endpoints: this.mapPaths(swaggerApi.paths, version),
		};
	}

	private mapPaths(paths: OpenAPI.Document['paths'], version: '2' | '3' | '3.1'): Record<string, Endpoint> {
		if (paths == undefined) {
			return {};
		}
		let _exhaustive: never;
		switch (version) {
			case '2':
				const typedPaths = paths as OpenAPIV2.PathsObject;
				const mappedEndpoints = Object.keys(typedPaths).flatMap((pathsUri: keyof typeof typedPaths) => {
					const paths = typedPaths[pathsUri];
					return Object.keys(paths).flatMap((pathsVerbUntyped) => {
						const pathsVerb = pathsVerbUntyped as keyof typeof paths;
						const pathData = paths[pathsVerb];
						const method = pathsVerb.toUpperCase() as RESTfulRequestVerb;
						if (!RESTfulRequestVerbs.includes(method)) {
							return [];
						}
						const defaultEndpointData: Endpoint = {
							verb: method,
							url: `${pathsUri}`,
							baseHeaders: {},
							baseQueryParams: {},
							description: '',
							name: `${method}: ${pathsUri}`,
							requests: [],
						};
						if (!pathData || typeof pathData === 'string') {
							return defaultEndpointData;
						}
						const parameters =
							(pathData as OpenAPIV2.OperationObject)?.parameters ?? (pathData as OpenAPIV2.Parameters | undefined);
						if (!parameters) {
							return defaultEndpointData;
						}
						// TODO: Parse input specs
						return defaultEndpointData;
					});
				});
				const endpoints: Record<string, Endpoint> = {};
				mappedEndpoints.forEach((endpoint) => (endpoints[endpoint.name] = endpoint));
				return endpoints;
			case '3':
				break;
			case '3.1':
				break;
			default:
				_exhaustive = version;
		}
		return {};
	}
}

export const swaggerParseManager = SwaggerParseManager.INSTANCE;
