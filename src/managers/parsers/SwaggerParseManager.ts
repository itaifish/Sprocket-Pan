import {
	EMPTY_ENVIRONMENT,
	EMPTY_HEADERS,
	EMPTY_QUERY_PARAMS,
	Endpoint,
	EndpointRequest,
	RESTfulRequestVerb,
	RESTfulRequestVerbs,
	Service,
} from '../../types/application-data/application-data';
import { log } from '../../utils/logging';
import { OpenAPI, OpenAPIV2, OpenAPIV3, OpenAPIV3_1 } from 'openapi-types';
import SwaggerParser from '@apidevtools/swagger-parser';
import { readTextFile } from '@tauri-apps/api/fs';
import yaml from 'js-yaml';
import { v4 } from 'uuid';
import * as xmlParse from 'xml2js';
import { QueryParamUtils } from '../../utils/data-utils';

export type ParsedServiceApplicationData = {
	services: Service[];
	endpoints: Endpoint[];
	requests: EndpointRequest[];
};

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
			const loadedFile = await this.loadSwaggerFile(inputType, inputValue);
			const input = this.parseSwaggerInput(loadedFile);
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
		const swaggerV3 = swaggerApi as OpenAPIV3.Document;
		let baseUrl = (swaggerApi as OpenAPIV2.Document)?.host;
		if ((swaggerV3?.servers?.length as number) > 0) {
			baseUrl ??= swaggerV3?.servers![0].url;
		}
		baseUrl ??= '';
		const services: Service[] = [
			{
				id: v4(),
				name: swaggerApi?.info?.title ?? 'New Service',
				version: swaggerApi?.info?.version ?? '1.0.0',
				description: swaggerApi?.info?.description ?? '',
				baseUrl,
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
				return this.mapV3Path(paths, service);
			case '3.1':
				return this.mapV3Path(paths, service, true);
			default:
				_exhaustive = version;
		}
		return empty;
	}

	private mapV3Path(paths: OpenAPI.Document['paths'], service: Service, is3_1: boolean = false) {
		const typedPaths = paths as OpenAPIV3.PathsObject;
		const mappedRequests: EndpointRequest[] = [];
		const mappedEndpoints = Object.keys(typedPaths).flatMap((pathsUri: keyof typeof typedPaths) => {
			const paths = typedPaths[pathsUri] ?? {};
			return RESTfulRequestVerbs.map((verb) => verb.toLocaleLowerCase() as Lowercase<RESTfulRequestVerb>).flatMap(
				(verb) => {
					const pathData = paths[verb];
					if (pathData == undefined) {
						return [];
					}
					const method = verb.toLocaleUpperCase() as RESTfulRequestVerb;
					const defaultEndpointData: Endpoint = {
						id: v4(),
						serviceId: service.id,
						verb: method,
						url: `${pathsUri}`,
						baseHeaders: structuredClone(EMPTY_HEADERS),
						baseQueryParams: structuredClone(EMPTY_QUERY_PARAMS),
						description: pathData.description ?? 'This is a new endpoint',
						name: `${method}: ${pathsUri}`,
						requestIds: [],
						defaultRequest: null,
					};
					service.endpointIds.push(defaultEndpointData.id);
					const parameters = pathData.parameters ?? [];

					const newRequestBase: Omit<EndpointRequest, 'body'> & { body: any } = {
						id: v4(),
						endpointId: defaultEndpointData.id,
						name: defaultEndpointData.name,
						headers: structuredClone(EMPTY_HEADERS),
						queryParams: structuredClone(EMPTY_QUERY_PARAMS),
						body: undefined,
						bodyType: 'none',
						rawType: undefined,
						history: [],
						environmentOverride: structuredClone(EMPTY_ENVIRONMENT),
					};
					const newRequests: EndpointRequest[] = [];
					parameters.forEach((param) => {
						const typedParam = param as OpenAPIV3.ParameterObject;
						const paramIn = typedParam.in;
						const schema = typedParam.schema as OpenAPIV3.SchemaObject | undefined;
						const type = schema?.type ?? 'string';
						switch (paramIn) {
							case 'header':
								if (typedParam.name) {
									defaultEndpointData.baseHeaders[typedParam.name] = type;
								}
								break;
							case 'query':
								if (typedParam.name) {
									QueryParamUtils.add(defaultEndpointData.baseQueryParams, typedParam.name, type);
									if (schema?.type === 'array') {
										QueryParamUtils.add(defaultEndpointData.baseQueryParams, typedParam.name, `${type}2`);
									}
								}
								break;
							case 'path':
								break;
							case 'cookie':
								break;
						}
					});
					if (pathData.requestBody) {
						const typedRequestBody = pathData.requestBody as OpenAPIV3.RequestBodyObject;
						Object.keys(typedRequestBody.content).forEach((contentType) => {
							const newId = v4();
							const body = is3_1
								? this.getExampleSwaggerBodyObjectV3_1(
										typedRequestBody.content[contentType].schema as OpenAPIV3_1.SchemaObject,
								  )
								: this.getExampleSwaggerBodyObject(
										typedRequestBody.content[contentType].schema as OpenAPIV3.SchemaObject,
								  );
							if (contentType.includes('json')) {
								newRequests.push({
									...newRequestBase,
									body: JSON.stringify(body),
									bodyType: 'raw',
									rawType: 'JSON',
									id: newId,
								});
							} else if (contentType.includes('xml')) {
								newRequests.push({
									...newRequestBase,
									body: new xmlParse.Builder().buildObject(body),
									bodyType: 'raw',
									rawType: 'XML',
									id: newId,
								});
							} else if (contentType.includes('x-www-form-urlencoded')) {
								const newEndpoint: EndpointRequest<'x-www-form-urlencoded'> = {
									...newRequestBase,
									bodyType: 'x-www-form-urlencoded',
									id: newId,
									rawType: undefined,
								};
								newRequests.push(newEndpoint);
							} else {
								newRequests.push({ ...newRequestBase, id: newId });
							}
							if (defaultEndpointData.defaultRequest == null) {
								defaultEndpointData.defaultRequest = newId;
							}
							defaultEndpointData.requestIds.push(newId);
						});
					} else {
						newRequests.push(newRequestBase);
						defaultEndpointData.requestIds.push(newRequestBase.id);
						defaultEndpointData.defaultRequest = newRequestBase.id;
					}
					mappedRequests.push(...newRequests);
					return defaultEndpointData;
				},
			);
		});
		return { endpoints: mappedEndpoints, requests: mappedRequests };
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
				const defaultEndpointData: Endpoint = {
					id: v4(),
					serviceId: service.id,
					verb: method,
					url: `${pathsUri}`,
					baseHeaders: structuredClone(EMPTY_HEADERS),
					baseQueryParams: structuredClone(EMPTY_QUERY_PARAMS),
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
					headers: structuredClone(EMPTY_HEADERS),
					queryParams: structuredClone(EMPTY_QUERY_PARAMS),
					body: undefined,
					bodyType: 'none',
					rawType: undefined,
					history: [],
					environmentOverride: EMPTY_ENVIRONMENT,
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
							const body = this.getExampleSwaggerBodyObject(typedParam.schema);
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
								QueryParamUtils.add(defaultEndpointData.baseQueryParams, typedParam.name, 'string');
								if (typedParam.type === 'array') {
									QueryParamUtils.add(defaultEndpointData.baseQueryParams, typedParam.name, 'string2');
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
				defaultEndpointData.defaultRequest = newRequests[0]?.id;
				mappedRequests.push(...newRequests);

				return defaultEndpointData;
			});
		});
		return { endpoints: mappedEndpoints, requests: mappedRequests };
	}

	private getExampleSwaggerBodyObject(object: OpenAPIV3.SchemaObject): any {
		const resObj: any = {};
		const type = object.type;
		let _exhaustive: never;
		if (object.example) {
			return object.example;
		}
		switch (type) {
			case 'string':
				return 'string';
			case 'number':
				return 0.5;
			case 'boolean':
				return true;
			case 'object':
				Object.entries(object.properties ?? {}).forEach(([key, value]) => {
					resObj[key] = this.getExampleSwaggerBodyObject(value as OpenAPIV3.SchemaObject);
				});
				return resObj;
			case 'integer':
				return 1;
			case 'array':
				return [
					this.getExampleSwaggerBodyObject((object as OpenAPIV3.ArraySchemaObject).items as OpenAPIV3.SchemaObject),
				];
			case undefined:
				break;
			default:
				_exhaustive = type;
		}
	}

	private getExampleSwaggerBodyObjectV3_1(object: OpenAPIV3_1.SchemaObject) {
		const resObj: any = {};
		const type = object.type;
		let _exhaustive: never;
		let nonArrayType: 'array' | OpenAPIV3_1.NonArraySchemaObjectType | undefined;
		if (type?.length) {
			nonArrayType = type[0] as 'array' | OpenAPIV3_1.NonArraySchemaObjectType | undefined;
		} else {
			nonArrayType = type as 'array' | OpenAPIV3_1.NonArraySchemaObjectType | undefined;
		}
		const example = object.example ?? (object?.examples?.length ?? 0) > 0 ? object.examples![0] : null;
		if (example) {
			return example;
		}
		switch (nonArrayType) {
			case 'string':
				return 'string';
			case 'number':
				return 0.5;
			case 'boolean':
				return true;
			case 'object':
				Object.entries(object.properties ?? {}).forEach(([key, value]) => {
					resObj[key] = this.getExampleSwaggerBodyObject(value as OpenAPIV3.SchemaObject);
				});
				return resObj;
			case 'integer':
				return 1;
			case 'array':
				return [
					this.getExampleSwaggerBodyObject((object as OpenAPIV3.ArraySchemaObject).items as OpenAPIV3.SchemaObject),
				];
			case 'null':
			case undefined:
				break;
			default:
				_exhaustive = nonArrayType;
		}
	}
}

const swaggerParseManager = SwaggerParseManager.INSTANCE;
export default swaggerParseManager;
