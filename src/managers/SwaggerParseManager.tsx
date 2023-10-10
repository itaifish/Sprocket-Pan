import {
	Endpoint,
	EndpointRequest,
	RESTfulRequestVerb,
	RESTfulRequestVerbs,
	Service,
} from '../types/application-data/application-data';
import { log } from '../utils/logging';
import { OpenAPI, OpenAPIV2, OpenAPIV3 } from 'openapi-types';
import * as SwaggerParser from '@apidevtools/swagger-parser';
import { readTextFile } from '@tauri-apps/api/fs';
import yaml from 'js-yaml';
import { v4 } from 'uuid';

type ParsedServiceApplicationData = {
	services: Service[];
	endpoints: Endpoint[];
	requests: EndpointRequest[];
};
class SwaggerParseManager {
	public static readonly INSTANCE = new SwaggerParseManager();
	private parser: SwaggerParser;
	private constructor() {
		this.parser = new SwaggerParser();
	}

	public async parseSwaggerFile(
		inputType: 'fileContents' | 'filePath',
		inputValue: string,
	): Promise<ParsedServiceApplicationData> {
		try {
			const input = this.parseSwaggerInput(await this.loadSwaggerFile(inputType, inputValue));
			const api: OpenAPI.Document | undefined = await this.parser?.dereference(input);
			if (!api) {
				log.warn(`parser is: ${JSON.stringify(this.parser)}`);
				throw new Error('Waiting on parser to load');
			}
			return this.mapApiToApplicationData(api);
		} catch (e) {
			log.error(e);
			return Promise.reject(e);
		}
	}

	private parseSwaggerInput(input: string) {
		return yaml.load(input) as OpenAPI.Document;
	}

	private async loadSwaggerFile(inputType: 'fileContents' | 'filePath', inputValue: string): Promise<string> {
		if (inputType === 'fileContents') {
			return inputValue;
		}
		return await readTextFile(inputValue);
	}

	private mapApiToApplicationData(swaggerApi: OpenAPI.Document): ParsedServiceApplicationData {
		const version =
			(swaggerApi as OpenAPIV2.Document).swagger != null
				? '2'
				: (swaggerApi as OpenAPIV3.Document).openapi.charAt(3) === '0'
				? '3'
				: '3.1';
		const services: Service[] = [
			{
				id: v4(),
				name: swaggerApi?.info?.title ?? 'New Service',
				version: swaggerApi?.info?.version ?? '1.0.0',
				description: swaggerApi?.info?.description ?? '',
				baseUrl: swaggerApi?.externalDocs?.url ?? '',
				localEnvironments: {},
				endpointIds: [],
			},
		];
		return { services, ...this.mapPaths(swaggerApi.paths, version, services[0]) };
	}

	private mapPaths(
		paths: OpenAPI.Document['paths'],
		version: '2' | '3' | '3.1',
		service: Service,
	): Omit<ParsedServiceApplicationData, 'services'> {
		const empty = {
			endpoints: [],
			requests: [],
		};
		if (paths == undefined) {
			return empty;
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
							id: v4(),
							serviceId: service.id,
							verb: method,
							url: `${pathsUri}`,
							baseHeaders: {},
							baseQueryParams: {},
							description: 'This is a new endpoint',
							name: `${method}: ${pathsUri}`,
							requestIds: [],
						};
						service.endpointIds.push(defaultEndpointData.id);
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
				return { endpoints: mappedEndpoints, requests: [] };
			case '3':
				break;
			case '3.1':
				break;
			default:
				_exhaustive = version;
		}
		return empty;
	}
}

const swaggerParseManager = SwaggerParseManager.INSTANCE;
export default swaggerParseManager;
