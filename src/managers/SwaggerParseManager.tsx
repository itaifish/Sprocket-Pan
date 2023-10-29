import {
	Endpoint,
	EndpointRequest,
	RESTfulRequestVerb,
	RESTfulRequestVerbs,
	Service,
} from '../types/application-data/application-data';
import { log } from '../utils/logging';
import { OpenAPI, OpenAPIV2, OpenAPIV3 } from 'openapi-types';
import SwaggerParser from '@apidevtools/swagger-parser';
import { readTextFile } from '@tauri-apps/api/fs';
import yaml from 'js-yaml';
import { v4 } from 'uuid';
import * as xmlParse from 'xml2js';

type ParsedServiceApplicationData = {
	services: Service[];
	endpoints: Endpoint[];
	requests: EndpointRequest[];
};

type SwaggerDataType = 'string' | 'number' | 'integer' | 'boolean' | 'array' | 'object';

type SwaggerParamInType = 'body' | 'query' | 'path' | 'header' | 'formData';

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
				return this.mapV2Path(paths, service);
			case '3':
				break;
			case '3.1':
				break;
			default:
				_exhaustive = version;
		}
		return empty;
	}

	private mapV2Path(paths: OpenAPI.Document['paths'], service: Service) {
		const typedPaths = paths as OpenAPIV2.PathsObject;
		const mappedRequests: EndpointRequest[] = [];
		const mappedEndpoints = Object.keys(typedPaths).flatMap((pathsUri: keyof typeof typedPaths) => {
			const paths = typedPaths[pathsUri];
			return Object.keys(paths).flatMap((pathsVerbUntyped) => {
				const pathsVerb = pathsVerbUntyped as keyof typeof paths;
				const pathData = paths[pathsVerb];
				const method = pathsVerb.toUpperCase() as RESTfulRequestVerb;
				if (!RESTfulRequestVerbs.includes(method)) {
					return [];
				}
				// todo add fefault
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
					defaultRequest: null,
				};
				service.endpointIds.push(defaultEndpointData.id);
				if (!pathData || typeof pathData === 'string') {
					return defaultEndpointData;
				}
				const typedPathData = pathData as OpenAPIV2.OperationObject;
				defaultEndpointData.description = typedPathData?.description ?? defaultEndpointData.description;

				const parameters = typedPathData?.parameters ?? (pathData as OpenAPIV2.Parameters | undefined);
				if (!parameters) {
					return defaultEndpointData;
				}

				const newRequestBase: Omit<EndpointRequest, 'body'> & { body: any } = {
					id: v4(),
					endpointId: defaultEndpointData.id,
					name: defaultEndpointData.name,
					headers: {},
					queryParams: {},
					body: undefined,
					bodyType: 'none',
					rawType: undefined,
					history: [],
					environmentOverride: {},
				};
				const newRequests: EndpointRequest[] = [];
				parameters.forEach((param) => {
					const typedParam = param as OpenAPIV2.Parameter;
					const paramIn = typedParam?.in as SwaggerParamInType | null;
					let _exaustive: never;
					switch (paramIn) {
						case null:
							break;
						case 'body':
							const body = this.getExampleSwaggerV2BodyObject(typedParam.schema);
							newRequestBase.body = body;
							break;
						case 'header':
							if (typedParam.name) {
								defaultEndpointData.baseHeaders[typedParam.name] = typedParam.type ?? 'string';
							}
							break;
						case 'formData':
							if (!newRequestBase.body || typeof newRequestBase.body != 'object') {
								newRequestBase.body = {};
							}
							if (typedParam.type === 'file' && typedParam?.name) {
								newRequestBase.body[typedParam.name] = '__file';
							} else {
								newRequestBase.body[typedParam.name] = 'string';
							}
							break;
						case 'query':
							if (typedParam.name) {
								if (typedParam.type === 'array') {
									defaultEndpointData.baseQueryParams[typedParam.name] = ['string'];
								} else {
									defaultEndpointData.baseQueryParams[typedParam.name] = ['string', 'string2'];
								}
							}
							break;
						case 'path':
							break;
						default:
							_exaustive = paramIn;
					}
				});

				const mimeTypes = typedPathData?.consumes;
				if (mimeTypes) {
					mimeTypes.forEach((mimeType) => {
						const newId = v4();
						if (mimeType.includes('json')) {
							newRequests.push({
								...newRequestBase,
								body: JSON.stringify(newRequestBase.body),
								bodyType: 'raw',
								rawType: 'JSON',
								id: newId,
							});
							defaultEndpointData.requestIds.push(newId);
						} else if (mimeType.includes('xml')) {
							newRequests.push({
								...newRequestBase,
								body: new xmlParse.Builder().buildObject(newRequestBase.body),
								bodyType: 'raw',
								rawType: 'XML',
								id: newId,
							});
							defaultEndpointData.requestIds.push(newId);
						} else if (mimeType.includes('x-www-form-urlencoded')) {
							const newEndpoint: EndpointRequest<'x-www-form-urlencoded'> = {
								...newRequestBase,
								bodyType: 'x-www-form-urlencoded',
								id: newId,
								rawType: undefined,
							};
							newRequests.push(newEndpoint);
						}
					});
				} else {
					newRequests.push(newRequestBase);
					defaultEndpointData.requestIds.push(newRequestBase.id);
				}

				mappedRequests.push(...newRequests);

				return defaultEndpointData;
			});
		});
		return { endpoints: mappedEndpoints, requests: mappedRequests };
	}

	private getExampleSwaggerV2BodyObject(object: any): any {
		const resObj: any = {};
		const type = object.type as SwaggerDataType;
		let _exhaustive: never;
		switch (type) {
			case 'string':
				return 'string';
			case 'number':
				return 0.5;
			case 'boolean':
				return true;
			case 'object':
				Object.entries(object.properties ?? {}).forEach(([key, value]) => {
					resObj[key] = this.getExampleSwaggerV2BodyObject(value);
				});
				return resObj;
			case 'integer':
				return 1;
			case 'array':
				return [this.getExampleSwaggerV2BodyObject(object.items)];
			default:
				_exhaustive = type;
		}
	}
}

const swaggerParseManager = SwaggerParseManager.INSTANCE;
export default swaggerParseManager;
