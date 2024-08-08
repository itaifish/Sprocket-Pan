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
import { camelCaseToTitle, getLongestCommonSubstringStartingAtBeginning } from '../../utils/string';

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

class PostmanParseManager {
	public static readonly INSTANCE = new PostmanParseManager();

	private constructor() {}

	importPostmanCollection(collection: PostmanCollection) {
		const { item, info, variable, auth, event } = collection;
		const items = this.importItems(info, item);
		const env = this.importVariables((variable as { [key: string]: string }[]) || []);
		const preRequestScript = this.importPreRequestScript(event);
		const postRequestScript = this.importAfterResponseScript(event);
	}

	private consolidateUnderGroupedServices(items: ImportedGrouping): ImportedGrouping {
		const services: Service[] = [];
		const endpoints: Endpoint[] = [];
		const requests: EndpointRequest[] = [];

		const groupings = new Map<string, string>();

		endpoints.forEach((endpoint) => {
			try {
				const url = new URL(endpoint.url);
				const root = url.origin;
				const currentRootPath = groupings.get(root);
				if (currentRootPath != undefined) {
					const sharedPath = getLongestCommonSubstringStartingAtBeginning(currentRootPath, url.pathname);
					groupings.set(root, sharedPath);
				} else {
					groupings.set(root, url.pathname);
				}
			} catch (e) {
				// throws when URL is invalid
				groupings.set(endpoint.url, endpoint.url);
			}
		});
		// clear existing matches since we're making new ones
		services.forEach((service) => (service.endpointIds = []));
		endpoints.forEach((endpoint) => {
			
		});

		return { services, endpoints, requests };
	}

	private importVariables(variables: { [key: string]: string }[]): Environment {
		const env = EnvironmentUtils.new();
		variables.forEach((variable) => {
			const { key, value } = variable;
			if (key) {
				EnvironmentUtils.set(env, key, value);
			}
		});
		return env;
	}

	private importItems = (info: PostmanCollection['info'], items: PostmanCollection['item']): ImportedGrouping => {
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

		const services: Service[] = [rootService];
		const endpoints: Endpoint[] = [];
		const requests: EndpointRequest[] = [];

		items.forEach((item) => {
			if (Object.prototype.hasOwnProperty.call(item, 'request')) {
				const res = this.importRequestItem(item as Item, rootService.id);
				if (res != null) {
					const { request, endpoint } = res;
					requests.push(request);
					endpoints.push(endpoint);
				}
			} else {
				const newItems = this.importItems(info, item.item as PostmanCollection['item']);
				services.push(...newItems.services);
				endpoints.push(...newItems.endpoints);
				requests.push(...newItems.requests);
			}
		});

		return { services, endpoints, requests };
	};

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
			HeaderUtils.set(result, header.key, header.value);
		});
		return result;
	};

	private importParameters = (parameters: QueryParam[]): QueryParams => {
		const result = QueryParamUtils.new();
		if (!parameters || parameters?.length === 0) {
			return result;
		}
		parameters.forEach(({ key, value }) => QueryParamUtils.add(result, key ?? 'Unknown Key', value ?? ''));
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
					body: body.raw,
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
		if (!url) {
			return '';
		}

		// remove ? and everything after it if there are QueryParams strictly defined
		if (typeof url === 'object' && url.query && url.raw?.includes('?')) {
			return url.raw?.slice(0, url.raw.indexOf('?')) || '';
		}

		if (typeof url === 'object' && url.raw) {
			return url.raw;
		}

		if (typeof url === 'string') {
			return url;
		}
		return '';
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
