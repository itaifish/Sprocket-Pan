import { OpenAPI, OpenAPIV2, OpenAPIV3, OpenAPIV3_1 } from 'openapi-types';
import SwaggerParser from '@apidevtools/swagger-parser';
import yaml from 'js-yaml';
import * as xmlParse from 'xml2js';
import { EndpointRequest, Service, WorkspaceData } from '@/types/data/workspace';
import { RESTfulRequestVerbs, RESTfulRequestVerb } from '@/types/data/shared';
import { log } from '@/utils/logging';
import { ItemFactory } from '../data/ItemFactory';

type SwaggerWorkspaceData = Pick<WorkspaceData, 'services' | 'endpoints' | 'requests' | 'version'>;

const parser = new SwaggerParser();

type SupportedAPIs = OpenAPIV2.Document | OpenAPIV3.Document | OpenAPIV3_1.Document;

type SupportedVersions = '3' | '3.1' | '2';

export class SwaggerParseManager {
	public static async parse(content: string): Promise<SwaggerWorkspaceData> {
		const input = this.parseSwaggerInput(content);
		const api = await parser?.dereference(input);
		if (api == null) {
			log.warn(`parser is: ${JSON.stringify(parser)}`);
			throw new Error('Waiting on parser to load');
		}
		return this.mapApiToWorkspaceData(api);
	}

	private static parseSwaggerInput(input: string) {
		return yaml.load(input) as OpenAPI.Document;
	}

	private static determineVersion(api: SupportedAPIs) {
		// here is where we should check to see if it's some other weird version other than 2, 3, or 3.1 and throw an unsupported error.
		if ('swagger' in api) return '2';
		return api.openapi.charAt(3) === '0' ? '3' : '3.1';
	}

	private static mapApiToWorkspaceData(api: SupportedAPIs): SwaggerWorkspaceData {
		const version = this.determineVersion(api);
		const baseUrl = 'swagger' in api ? api.host : api.servers?.[0].url;
		const rootService = ItemFactory.service({
			name: api?.info?.title ?? 'New Postman Import',
			version: api?.info?.version,
			description: api?.info?.description,
			baseUrl,
		});
		return {
			version: 10,
			services: { [rootService.id]: rootService },
			...this.mapPaths(api.paths, version, rootService),
		};
	}

	private static mapPaths(
		paths: OpenAPI.Document['paths'],
		version: SupportedVersions,
		service: Service,
	): Pick<SwaggerWorkspaceData, 'endpoints' | 'requests'> {
		if (paths == undefined) {
			return {
				endpoints: {},
				requests: {},
			};
		}
		switch (version) {
			case '2':
				return this.mapV2Paths(paths as OpenAPIV2.PathsObject, service);
			case '3':
				return this.mapV3Paths(paths as OpenAPIV3.PathsObject, service);
			case '3.1':
				return this.mapV3Paths(paths as OpenAPIV3_1.PathsObject, service, true);
		}
	}

	private static mapV3Paths(pathsObj: OpenAPIV3.PathsObject, service: Service, is3_1: boolean = false) {
		const requests: SwaggerWorkspaceData['requests'] = {};
		const endpoints: SwaggerWorkspaceData['endpoints'] = {};
		Object.entries(pathsObj).forEach(([pathsUri, paths = {}]) => {
			RESTfulRequestVerbs.map((verb) => verb.toLocaleLowerCase() as Lowercase<RESTfulRequestVerb>).forEach((verb) => {
				const pathData = paths[verb];
				if (pathData == undefined) {
					return [];
				}
				const method = verb.toLocaleUpperCase() as RESTfulRequestVerb;
				const endpoint = ItemFactory.endpoint({
					serviceId: service.id,
					verb: method,
					url: `${pathsUri}`,
					description: pathData.description,
					name: `${method}: ${pathsUri}`,
				});
				service.endpointIds.push(endpoint.id);
				endpoints[endpoint.id] = endpoint;
				pathData.parameters?.forEach((param) => {
					if (!('in' in param) || param.name == null) return;
					const schema = param.schema as OpenAPIV3.SchemaObject | undefined;
					const type = schema?.type ?? 'string';
					switch (param.in) {
						case 'header':
							endpoint.baseHeaders.push({ key: param.name, value: type });
							break;
						case 'query':
							endpoint.baseQueryParams.push({
								key: param.name,
								value: type === 'array' ? `${type}2` : type,
							});
							break;
					}
				});
				const requests: SwaggerWorkspaceData['requests'] = {};
				const baseRequestProperties = {
					endpointId: endpoint.id,
					name: endpoint.name,
				};
				if (pathData.requestBody == null || !('content' in pathData.requestBody)) {
					const request = ItemFactory.request(baseRequestProperties);
					requests[request.id] = request;
					endpoint.requestIds.push(request.id);
					endpoint.defaultRequest = request.id;
				} else {
					const content = pathData.requestBody.content;
					Object.keys(content).forEach((contentType) => {
						const body = is3_1
							? this.getExampleSwaggerBodyObjectV3_1(content[contentType].schema as OpenAPIV3_1.SchemaObject)
							: this.getExampleSwaggerBodyObject(content[contentType].schema as OpenAPIV3.SchemaObject);

						const request = this.getContentTypedRequest(contentType, body, baseRequestProperties);

						if (endpoint.defaultRequest == null) {
							endpoint.defaultRequest = request.id;
						}
						endpoint.requestIds.push(request.id);
						requests[request.id] = request;
					});
				}
			});
		});
		return { endpoints, requests };
	}

	private static getContentTypedRequest(
		contentType: string,
		body: Record<string, string>,
		base: Partial<EndpointRequest>,
	) {
		if (contentType.includes('json')) {
			return ItemFactory.request({
				...base,
				body: JSON.stringify(body),
				bodyType: 'raw',
				rawType: 'JSON',
			});
		}
		if (contentType.includes('xml')) {
			return ItemFactory.request({
				...base,
				body: new xmlParse.Builder().buildObject(body),
				bodyType: 'raw',
				rawType: 'XML',
			});
		}
		if (contentType.includes('x-www-form-urlencoded')) {
			return ItemFactory.request({
				...base,
				bodyType: 'x-www-form-urlencoded',
			});
		}
		return ItemFactory.request(base);
	}

	private static mapV2Paths(pathsObj: OpenAPIV2.PathsObject, service: Service) {
		const requests: SwaggerWorkspaceData['requests'] = {};
		const endpoints: SwaggerWorkspaceData['endpoints'] = {};
		Object.entries(pathsObj).forEach(([pathsUri, paths]) => {
			Object.entries(paths).forEach(([pathVerb, pathData]) => {
				const method = pathVerb.toUpperCase() as RESTfulRequestVerb;
				if (!RESTfulRequestVerbs.includes(method)) return;
				const endpoint = ItemFactory.endpoint({
					serviceId: service.id,
					verb: method,
					url: `${pathsUri}`,
					name: `${method}: ${pathsUri}`,
				});
				endpoints[endpoint.id] = endpoint;
				service.endpointIds.push(endpoint.id);
				if (pathData === null || typeof pathData === 'string') return;

				if ('description' in pathData && pathData.description != null) {
					endpoint.description = pathData.description;
				}

				const parameters =
					'parameters' in pathData ? pathData.parameters : (pathData as OpenAPIV2.Parameters | undefined);

				if (parameters == null) return;

				const baseRequestProperties: Partial<EndpointRequest> = {
					endpointId: endpoint.id,
					name: endpoint.name,
					queryParams: [],
				};

				let body: Record<string, string> = {};
				let firstReqId = null;

				parameters.forEach((param) => {
					if (!('in' in param)) return;
					switch (param.in) {
						case 'body':
							body = this.getExampleSwaggerBodyObject(param.schema) ?? body;
							break;
						case 'header':
							if (param.name) {
								endpoint.baseHeaders.push({ key: param.name, value: param.type ?? 'string' });
							}
							break;
						case 'formData':
							body[param.name] = param.type === 'file' ? '__file' : 'string';
							break;
						case 'query':
							if (param.name) {
								baseRequestProperties.queryParams!.push({
									key: param.name,
									value: param.type === 'array' ? 'string2' : 'string',
								});
							}
							break;
					}
				});

				if ('consumes' in pathData) {
					pathData.consumes?.forEach((mimeType) => {
						const request = this.getContentTypedRequest(mimeType, body, baseRequestProperties);
						requests[request.id] = request;
						endpoint.requestIds.push(request.id);
						firstReqId ??= request.id;
					});
				} else {
					const request = ItemFactory.request(baseRequestProperties);
					requests[request.id] = request;
					endpoint.requestIds.push(request.id);
					firstReqId ??= request.id;
				}

				endpoint.defaultRequest = firstReqId;
			});
		});
		return { endpoints, requests };
	}

	private static getExampleSwaggerBodyObject(object: OpenAPIV3.SchemaObject): any {
		const resObj: any = {};
		const type = object.type;
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
		}
	}

	private static getExampleSwaggerBodyObjectV3_1(object: OpenAPIV3_1.SchemaObject) {
		const resObj: any = {};
		const type = object.type;
		let nonArrayType: 'array' | OpenAPIV3_1.NonArraySchemaObjectType | undefined;
		if (type?.length) {
			nonArrayType = type[0] as 'array' | OpenAPIV3_1.NonArraySchemaObjectType | undefined;
		} else {
			nonArrayType = type as 'array' | OpenAPIV3_1.NonArraySchemaObjectType | undefined;
		}
		const example = (object.example ?? (object?.examples?.length ?? 0) > 0) ? object.examples![0] : null;
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
		}
	}
}
