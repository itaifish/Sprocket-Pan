import { v4 } from 'uuid';
import {
	Endpoint,
	EndpointRequest,
	Environment,
	QueryParams,
	RawBodyType,
	RequestBodyType,
	RESTfulRequestVerb,
	RESTfulRequestVerbs,
	Script,
	Service,
	SPHeaders,
} from '../../types/application-data/application-data';
import { EnvironmentUtils, HeaderUtils, QueryParamUtils } from '../../utils/data-utils';
import type {
	Auth as V200Auth,
	EventList as V200EventList,
	Folder as V200Folder,
	FormParameter as V200FormParameter,
	Header as V200Header,
	HttpsSchemaGetpostmanComJsonCollectionV200 as V200Schema,
	Item as V200Item,
	Url,
	Request1 as V200Request1,
	UrlEncodedParameter as V200UrlEncodedParameter,
	Description as V200Description,
} from './parseTypes/postman2.0Types';
import type {
	Auth as V210Auth,
	EventList as V210EventList,
	Folder as V210Folder,
	FormParameter as V210FormParameter,
	Header as V210Header,
	HttpsSchemaGetpostmanComJsonCollectionV210 as V210Schema,
	Item as V210Item,
	Request1 as V210Request1,
	QueryParam,
	UrlEncodedParameter as V210UrlEncodedParameter,
	Description as V210Description,
} from './parseTypes/postman2.1Types';
import mime from 'mime';
import {
	camelCaseToTitle,
	getLongestCommonSubstringStartingAtBeginning,
	getStringDifference,
	toValidFunctionName,
} from '../../utils/string';
import { readTextFile } from '@tauri-apps/api/fs';
import { log } from '../../utils/logging';
import yaml from 'js-yaml';

type PostmanCollection = V200Schema | V210Schema;

type EventList = V200EventList | V210EventList;

type Authetication = V200Auth | V210Auth;

type Body = V200Request1['body'] | V210Request1['body'];

type UrlEncodedParameter = V200UrlEncodedParameter | V210UrlEncodedParameter;

type FormParameter = V200FormParameter | V210FormParameter;

type Item = V200Item | V210Item;

type Folder = V200Folder | V210Folder;

type Header = V200Header | V210Header;

type Description = V200Description | V210Description;

type ImportedGrouping = {
	services: Service[];
	endpoints: Endpoint[];
	requests: EndpointRequest[];
};

/**
 * Code and types inspired by / partially borrowed and modified from
 * https://github.com/Kong/insomnia/blob/570c1c005541c2c3715b522aab5f53d642a52f7a/packages/insomnia/src/utils/importers/importers/postman.ts
 */

class PostmanParseManager {
	public static readonly INSTANCE = new PostmanParseManager();

	private constructor() {}

	public async parsePostmanFile(inputType: 'fileContents' | 'filePath', inputValue: string) {
		try {
			const loadedFile = await this.loadPostmanFile(inputType, inputValue);
			const input = this.importPostmanCollection(this.parsePostmanInput(loadedFile));
			return input;
		} catch (e) {
			log.error(e);
			return Promise.reject(e);
		}
	}

	private parsePostmanInput(input: string) {
		return yaml.load(input) as PostmanCollection;
	}

	private async loadPostmanFile(inputType: 'fileContents' | 'filePath', inputValue: string): Promise<string> {
		if (inputType === 'fileContents') {
			return inputValue;
		}
		return await readTextFile(inputValue);
	}

	importPostmanCollection(collection: PostmanCollection) {
		const { item, info, variable, event } = collection;
		const items = this.importItems(info, item);
		const env = this.importVariables((variable as { [key: string]: string }[]) || []);
		const preRequestScript = this.importPreRequestScript(event);
		const postRequestScript = this.importAfterResponseScript(event);
		const scripts: Script[] = [];
		[preRequestScript, postRequestScript].forEach((script, index) => {
			if (script) {
				const name = index === 0 ? 'Postman Pre-Request Script' : 'Postman After-Response Script';
				scripts.push({
					name,
					scriptCallableName: toValidFunctionName(name),
					returnVariableName: null,
					id: v4(),
					content: script,
				});
			}
		});
		const { services, endpoints, requests } = this.consolidateUnderGroupedServices(items);
		return {
			services,
			endpoints,
			requests,
			scripts,
			environments: [env],
		};
	}

	private consolidateUnderGroupedServices(items: ReturnType<PostmanParseManager['importItems']>): ImportedGrouping {
		const services: Service[] = [];

		const groupings = new Map<string, string>();

		const updateGroupings = (root: string, path: string) => {
			const currentRootPath = groupings.get(root);
			if (currentRootPath != undefined) {
				const sharedPath = getLongestCommonSubstringStartingAtBeginning(currentRootPath, path);
				groupings.set(root, sharedPath);
			} else {
				groupings.set(root, path);
			}
		};

		items.endpoints.forEach((endpoint) => {
			try {
				const url = new URL(endpoint.url);
				updateGroupings(url.origin, url.pathname);
			} catch (e) {
				// throws when URL is invalid
				// if there are variables anywhere in the endpoint url
				const foundVariables = endpoint.url.match(/{.+?}/);
				if (foundVariables != null) {
					// skip ahead to end of first variable, as the starting point
					const startingPoint = foundVariables[0].length + (foundVariables.index ?? 0);
					const root = endpoint.url.substring(0, startingPoint);
					const extendedPath = endpoint.url.substring(startingPoint);
					updateGroupings(root, extendedPath);
				} else {
					groupings.set(endpoint.url, endpoint.url);
				}
			}
		});

		// map of full preceeding url to service
		const serviceMap = new Map<string, Service>();

		items.endpoints.forEach((endpoint) => {
			let urlRoot: string;
			try {
				urlRoot = new URL(endpoint.url).origin;
			} catch (e) {
				const foundVariables = endpoint.url.match(/{.+?}/);
				if (foundVariables != null) {
					const startingPoint = foundVariables[0].length + (foundVariables.index ?? 0);
					urlRoot = endpoint.url.substring(0, startingPoint);
				} else {
					urlRoot = endpoint.url;
				}
			}
			let existingService = serviceMap.get(urlRoot);
			if (existingService == null) {
				existingService = { ...structuredClone(items.service), id: v4(), baseUrl: urlRoot };
				serviceMap.set(urlRoot, existingService);
			}
			existingService.endpointIds.push(endpoint.id);
			endpoint.serviceId = existingService.id;
			endpoint.url = getStringDifference(endpoint.url, urlRoot);
		});

		services.push(...serviceMap.values());

		return { services, endpoints: items.endpoints, requests: items.requests };
	}

	private importVariables(variables: { [key: string]: string }[]): Environment {
		const env = EnvironmentUtils.new();
		variables.forEach((variable) => {
			const { key, value } = variable;
			if (key) {
				EnvironmentUtils.set(env, key, value);
			}
		});
		env.__name = 'Postman Variables';
		return env;
	}

	private importItems = (
		info: PostmanCollection['info'],
		items: PostmanCollection['item'],
	): Omit<ImportedGrouping, 'services'> & { service: Service } => {
		const rootService: Service = {
			name: info.name,
			id: v4(),
			description: this.importDescription(info.description),
			version: info.version
				? typeof info.version === 'string'
					? info.version
					: `${info.version.major}.${info.version.minor}.${info.version.patch}`
				: '1.0.0',
			endpointIds: [],
			localEnvironments: {},
			baseUrl: '',
		};

		const endpoints: Endpoint[] = [];
		const requests: EndpointRequest[] = [];
		items.forEach((item) => {
			if (Object.prototype.hasOwnProperty.call(item, 'request')) {
				const res = this.importRequestItem(item as Item, rootService.id);
				if (res != null) {
					const { request, endpoint } = res;
					requests.push(request);
					endpoints.push(endpoint);
				} else {
					log.trace(`res is null for item ${item.name}`);
				}
			} else {
				const newItems = this.importItems(info, item.item as PostmanCollection['item']);
				endpoints.push(...newItems.endpoints);
				requests.push(...newItems.requests);
			}
		});

		return { service: rootService, endpoints, requests };
	};

	private convertVariablesToSprocketVariables<TOnlyReturnsUndefinedIfInputIsUndefined extends string | undefined>(
		postmanString: TOnlyReturnsUndefinedIfInputIsUndefined,
	): TOnlyReturnsUndefinedIfInputIsUndefined {
		if (postmanString == undefined) {
			return undefined as TOnlyReturnsUndefinedIfInputIsUndefined;
		}
		// replace double curlies with single curlies
		return postmanString.replaceAll(/{({.*?})}/g, '$1') as TOnlyReturnsUndefinedIfInputIsUndefined;
	}

	private importRequestItem = (
		{ request, name = '', event }: Item,
		parentId: string,
	): { request: EndpointRequest; endpoint: Endpoint } | null => {
		if (typeof request === 'string') {
			return null;
		}

		const headers = this.importHeaders(request.header);

		let parameters = QueryParamUtils.new();

		const url = this.importUrl(request.url);
		if (typeof request.url === 'object' && request.url?.query) {
			parameters = this.importParameters(request.url?.query);
		}

		const preRequestScript = this.importPreRequestScript(event);
		const postRequestScript = this.importAfterResponseScript(event);

		const endpointId = v4();
		const requestId = v4();

		const { body, bodyType, rawType } = this.importBody(
			request.body,
			(camelCaseToTitle(mime.getExtension(headers['Content-Type']) ?? '') as RawBodyType) || undefined,
		);

		const newRequest: EndpointRequest = {
			id: requestId,
			endpointId,
			name,
			headers: HeaderUtils.new(),
			queryParams: QueryParamUtils.new(),
			history: [],
			environmentOverride: EnvironmentUtils.new(),
			body,
			bodyType,
			rawType,
		};

		const newEndpoint: Endpoint = {
			id: endpointId,
			requestIds: [requestId],
			url,
			verb: RESTfulRequestVerbs.includes(request.method as RESTfulRequestVerb)
				? (request.method as RESTfulRequestVerb)
				: 'GET',
			baseHeaders: headers,
			name,
			description: this.importDescription(request.description),
			serviceId: parentId,
			baseQueryParams: parameters,
			defaultRequest: requestId,
			preRequestScript,
			postRequestScript,
		};

		return { request: newRequest, endpoint: newEndpoint };
	};

	private importDescription(description?: Description | string | null) {
		if (typeof description === 'string') {
			return description;
		}
		return description?.content ?? 'Imported from Postman';
	}

	private importHeaders = (headers?: Header[] | string): SPHeaders => {
		const result = HeaderUtils.new();
		if (typeof headers === 'string' || typeof headers === 'undefined') {
			return result;
		}
		headers.forEach((header) => {
			HeaderUtils.set(
				result,
				this.convertVariablesToSprocketVariables(header.key),
				this.convertVariablesToSprocketVariables(header.value),
			);
		});
		return result;
	};

	private importParameters = (parameters: QueryParam[]): QueryParams => {
		const result = QueryParamUtils.new();
		if (!parameters || parameters?.length === 0) {
			return result;
		}
		parameters.forEach(({ key, value }) =>
			QueryParamUtils.add(
				result,
				this.convertVariablesToSprocketVariables(key ?? 'Unknown Key'),
				this.convertVariablesToSprocketVariables(value ?? ''),
			),
		);
		return result;
	};

	private importBody = (
		body: Body,
		contentType?: RawBodyType,
	): { body: EndpointRequest['body']; bodyType: RequestBodyType; rawType: RawBodyType | undefined } => {
		const defaultReturn = {
			body: undefined,
			bodyType: 'none',
			rawType: undefined,
		} as const;

		switch (body?.mode) {
			case null:
				return defaultReturn;
			case 'raw':
				return {
					body: this.convertVariablesToSprocketVariables(body.raw),
					bodyType: 'raw',
					rawType: contentType,
				};
			case 'urlencoded':
				return {
					body: body.urlencoded?.reduce(
						(acc, curr) => {
							Object.assign(acc, { [curr.key]: curr.value });
							return acc;
						},
						{} as Record<string, string>,
					),
					bodyType: 'x-www-form-urlencoded',
					rawType: undefined,
				};

			case 'formdata':
				return {
					body: body.formdata?.reduce(
						(acc, curr) => {
							Object.assign(acc, { [curr.key]: curr.value });
							return acc;
						},
						{} as Record<string, string>,
					),
					bodyType: 'form-data',
					rawType: undefined,
				};
			// TODO
			// case 'graphql':
			// 	return this.importBodyGraphQL(body.graphql);
			default:
				return defaultReturn;
		}
	};

	private importUrl = (url?: Url | string) => {
		let res: string = '';
		if (!url) {
			res = '';
		} else if (typeof url === 'object' && url.query && url.raw?.includes('?')) {
			// remove ? and everything after it if there are QueryParams strictly defined
			res = url.raw?.slice(0, url.raw.indexOf('?')) || '';
		} else if (typeof url === 'object' && url.raw) {
			res = url.raw;
		} else if (typeof url === 'string') {
			res = url;
		}
		return this.convertVariablesToSprocketVariables(res);
	};

	private importPreRequestScript = (events: EventList | undefined): string => {
		if (events == null) {
			return '';
		}

		const preRequestEvent = events.find((event) => event.listen === 'prerequest');

		const scriptOrRows = preRequestEvent != null ? preRequestEvent.script : '';
		if (scriptOrRows == null || scriptOrRows === '') {
			return '';
		}

		const scriptContent =
			scriptOrRows.exec != null
				? Array.isArray(scriptOrRows.exec)
					? scriptOrRows.exec.join('\n')
					: scriptOrRows.exec
				: '';

		return scriptContent;
	};

	private importAfterResponseScript = (events: EventList | undefined): string => {
		if (events == null) {
			return '';
		}

		const afterResponseEvent = events.find((event) => event.listen === 'test');

		const scriptOrRows = afterResponseEvent ? afterResponseEvent.script : '';
		if (!scriptOrRows) {
			return '';
		}

		const scriptContent = scriptOrRows.exec
			? Array.isArray(scriptOrRows.exec)
				? scriptOrRows.exec.join('\n')
				: scriptOrRows.exec
			: '';

		return scriptContent;
	};
}

export const postmanParseManager = PostmanParseManager.INSTANCE;
