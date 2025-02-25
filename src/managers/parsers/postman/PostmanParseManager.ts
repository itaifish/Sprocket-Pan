import { v4 } from 'uuid';
import type {
	EventList as V200EventList,
	Header as V200Header,
	HttpsSchemaGetpostmanComJsonCollectionV200 as V200Schema,
	Item as V200Item,
	Url,
	Request1 as V200Request1,
	Description as V200Description,
} from '../parseTypes/postman2.0Types';
import type {
	EventList as V210EventList,
	Header as V210Header,
	HttpsSchemaGetpostmanComJsonCollectionV210 as V210Schema,
	Item as V210Item,
	Request1 as V210Request1,
	QueryParam,
	Description as V210Description,
} from '../parseTypes/postman2.1Types';
import mime from 'mime';
import yaml from 'js-yaml';
import { CONTENT_TYPE } from '../../../constants/request';
import { OrderedKeyValuePairs } from '../../../classes/OrderedKeyValuePairs';
import { QueryParams, RawBodyType, RESTfulRequestVerbs, RESTfulRequestVerb, SPHeaders } from '@/types/data/shared';
import { Service, Endpoint, EndpointRequest, Script, WorkspaceData } from '@/types/data/workspace';
import { log } from '@/utils/logging';
import {
	toValidFunctionName,
	getLongestCommonSubstringStartingAtBeginning,
	getStringDifference,
	camelCaseToTitle,
} from '@/utils/string';
import { ItemFactory } from '@/managers/data/ItemFactory';
import { PostmanScriptParseManager } from './PostmanScriptParseManager';

type PostmanCollection = V200Schema | V210Schema;

type EventList = V200EventList | V210EventList;

type Body = V200Request1['body'] | V210Request1['body'];

type Item = V200Item | V210Item;

type Header = V200Header | V210Header;

type Description = V200Description | V210Description;

type PostmanWorkspaceData = Pick<WorkspaceData, 'services' | 'endpoints' | 'requests' | 'version'>;

type ImportSource = 'Postman' | 'Insomnia';

/**
 * Code and types inspired by / partially borrowed and modified from
 * https://github.com/Kong/insomnia/blob/570c1c005541c2c3715b522aab5f53d642a52f7a/packages/insomnia/src/utils/importers/importers/postman.ts
 */

export class PostmanParseManager {
	public static parse(content: string): PostmanWorkspaceData {
		return this.importPostmanCollection(this.parsePostmanInput(content), 'Postman');
	}

	private static parsePostmanInput(input: string) {
		return yaml.load(input) as PostmanCollection;
	}

	public static importPostmanCollection(collection: PostmanCollection, importSource: ImportSource) {
		const { item, info, variable = [], event } = collection;
		const items = this.importItems(info, item, importSource);
		const env = this.importVariables(variable, importSource);
		const preRequestScript = this.importPreRequestScript(event);
		const postRequestScript = this.importPostRequestScript(event);
		const scripts: Script[] = [];
		[preRequestScript, postRequestScript].forEach((script, index) => {
			if (script) {
				const name = index === 0 ? `${importSource} Pre-Request Script` : `${importSource} After-Response Script`;
				scripts.push({
					name,
					scriptCallableName: toValidFunctionName(name),
					id: v4(),
					content: script,
				});
			}
		});
		const { services, endpoints, requests } = this.consolidateUnderGroupedServices(items);
		return {
			version: 10,
			services,
			endpoints,
			requests,
			scripts,
			environments: [env],
		};
	}

	private static consolidateUnderGroupedServices(
		items: Pick<WorkspaceData, 'services' | 'endpoints' | 'requests'> & { rootService: Service },
	) {
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

		// map of full preceeding url to service
		const serviceMap = new Map<string, Service>();

		Object.values(items.endpoints).forEach((endpoint) => {
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
			let baseUrl: string;
			try {
				baseUrl = new URL(endpoint.url).origin;
			} catch (e) {
				const foundVariables = endpoint.url.match(/{.+?}/);
				if (foundVariables != null) {
					const startingPoint = foundVariables[0].length + (foundVariables.index ?? 0);
					baseUrl = endpoint.url.substring(0, startingPoint);
				} else {
					baseUrl = endpoint.url;
				}
			}
			let existingService = serviceMap.get(baseUrl);
			if (existingService == null) {
				existingService = ItemFactory.service({ ...items.rootService, baseUrl });
				serviceMap.set(baseUrl, existingService);
			}
			existingService.endpointIds.push(endpoint.id);
			endpoint.serviceId = existingService.id;
			endpoint.url = getStringDifference(endpoint.url, baseUrl);
		});

		return { services: serviceMap.values(), endpoints: items.endpoints, requests: items.requests };
	}

	private static importVariables(variables: { [key: string]: string }[], importSource: ImportSource) {
		return ItemFactory.environment({
			name: `${importSource} Variables`,
			pairs: variables.map(({ key, value }) => ({ key, value })),
		});
	}

	private static importItems(
		info: PostmanCollection['info'],
		items: PostmanCollection['item'],
		importSource: ImportSource,
	) {
		const rootService = ItemFactory.service({
			name: info.name,
			description: this.importDescription(info.description, importSource),
			version: info.version
				? typeof info.version === 'string'
					? info.version
					: `${info.version.major}.${info.version.minor}.${info.version.patch}`
				: '1.0.0',
		});
		let endpoints: WorkspaceData['endpoints'] = {};
		let requests: WorkspaceData['requests'] = {};
		let services: WorkspaceData['services'] = { [rootService.id]: rootService };
		items.forEach((item) => {
			if ('request' in item) {
				const res = this.importRequestItem(item, rootService.id, importSource);
				if (res != null) {
					requests[res.request.id] = res.request;
					endpoints[res.endpoint.id] = res.endpoint;
				} else {
					log.trace(`[PostmanParseManager] res is null for item ${item.name}`);
				}
			} else {
				const newItems = this.importItems(info, item.item, importSource);
				endpoints = { ...endpoints, ...newItems.endpoints };
				requests = { ...requests, ...newItems.requests };
				services = { ...services, ...newItems.services };
			}
		});

		return { services, endpoints, requests, rootService };
	}

	private static convertVariablesToSprocketVariables<
		TOnlyReturnsUndefinedIfInputIsUndefined extends string | undefined,
	>(postmanString: TOnlyReturnsUndefinedIfInputIsUndefined): TOnlyReturnsUndefinedIfInputIsUndefined {
		if (postmanString == undefined) {
			return undefined as TOnlyReturnsUndefinedIfInputIsUndefined;
		}
		// replace double curlies with single curlies
		return postmanString.replaceAll(/{({.*?})}/g, '$1') as TOnlyReturnsUndefinedIfInputIsUndefined;
	}

	private static importRequestItem = (
		{ request, name, event }: Item,
		parentId: string,
		importSource: ImportSource,
	): { request: EndpointRequest; endpoint: Endpoint } | null => {
		if (typeof request === 'string') {
			return null;
		}

		const headers = this.importHeaders(request.header);

		let parameters: QueryParams = [];

		const url = this.importUrl(request.url);
		if (typeof request.url === 'object' && request.url?.query) {
			parameters = this.importParameters(request.url?.query);
		}

		const preRequestScript = this.importPreRequestScript(event);
		const postRequestScript = this.importPostRequestScript(event);

		const { body, bodyType, rawType } = this.importBody(
			request.body,
			camelCaseToTitle(
				mime.getExtension(headers.find((header) => header.key === CONTENT_TYPE)?.value ?? '') ?? '',
			) as RawBodyType,
		);

		const endpoint = ItemFactory.endpoint({
			url,
			verb: RESTfulRequestVerbs.includes(request.method as RESTfulRequestVerb)
				? (request.method as RESTfulRequestVerb)
				: 'GET',
			baseHeaders: headers,
			name: name ?? `New ${importSource} Endpoint`,
			description: this.importDescription(request.description, importSource),
			serviceId: parentId,
			baseQueryParams: parameters,
			preRequestScript,
			postRequestScript,
		});

		const sprocketRequest = ItemFactory.request({
			endpointId: endpoint.id,
			name: name ?? `New ${importSource} Request`,
			body,
			bodyType,
			rawType,
		});

		endpoint.requestIds.push(sprocketRequest.id);
		endpoint.defaultRequest = sprocketRequest.id;

		return { request: sprocketRequest, endpoint };
	};

	private static importDescription(description: Description | string | null | undefined, importSource: ImportSource) {
		if (typeof description === 'string') {
			return description;
		}
		return description?.content ?? `Imported from ${importSource}`;
	}

	private static importHeaders(headers?: Header[] | string): SPHeaders {
		const result = new OrderedKeyValuePairs();
		if (Array.isArray(headers)) {
			headers.forEach(({ key, value }) => {
				result.set(this.convertVariablesToSprocketVariables(key), this.convertVariablesToSprocketVariables(value));
			});
		}
		return result.toArray();
	}

	private static importParameters(parameters?: QueryParam[]): QueryParams {
		const result = new OrderedKeyValuePairs();
		parameters?.forEach(({ key, value }) =>
			result.set(
				this.convertVariablesToSprocketVariables(key ?? 'Unknown Key'),
				this.convertVariablesToSprocketVariables(value ?? ''),
			),
		);
		return result.toArray();
	}

	private static importBody(
		body: Body,
		contentType?: RawBodyType,
	): Pick<EndpointRequest, 'body' | 'bodyType' | 'rawType'> {
		const defaultReturn = {
			body: undefined,
			bodyType: 'none',
			rawType: undefined,
		} as const;
		switch (body?.mode) {
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
		}
		return defaultReturn;
	}

	private static importUrl(url?: Url | string) {
		let res: string = '';
		if (url == null) {
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
	}

	private static importPreRequestScript(events?: EventList) {
		return this.importScript('prerequest', events);
	}

	private static importPostRequestScript(events?: EventList) {
		return this.importScript('test', events);
	}

	private static importScript(eventName: string, events?: EventList) {
		if (events == null) {
			return '';
		}
		const event = events.find((event) => event.listen === eventName);
		if (event?.script == null || event.script.exec == null) {
			return '';
		}
		const scriptContent = Array.isArray(event.script.exec) ? event.script.exec.join('\n') : event.script.exec;
		return PostmanScriptParseManager.convertPostmanScriptToSprocketPan(scriptContent);
	}
}
