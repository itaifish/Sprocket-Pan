import {
	WorkspaceData,
	EndpointRequest,
	EndpointResponse,
	getRequestBodyCategory,
	NetworkFetchRequest,
	RawBodyType,
	RawBodyTypes,
	rawBodyTypeToMime,
} from '../types/application-data/application-data';
import { getEnvValuesFromData, queryParamsToString, toKeyValuePairs } from '../utils/application';
import { EnvironmentContextResolver } from './EnvironmentContextResolver';
import { asyncCallWithTimeout } from '../utils/functions';
import { Body, ResponseType, fetch } from '@tauri-apps/api/http';
import { capitalizeWord } from '../utils/string';
import { AuditLog, RequestEvent, auditLogManager } from './AuditLogManager';
import { StateAccess } from '../state/types';
import { scriptRunnerManager } from './scripts/ScriptRunnerManager';
import { SprocketError } from '../types/state/state';
import * as xmlParse from 'xml2js';
import yaml from 'js-yaml';
import { log } from '../utils/logging';
import { OrderedKeyValuePairs } from '../classes/OrderedKeyValuePairs';
import { CONTENT_TYPE } from '../constants/request';

class NetworkRequestManager {
	public static readonly INSTANCE = new NetworkRequestManager();

	private xmlBuilder: xmlParse.Builder;

	private constructor() {
		this.xmlBuilder = new xmlParse.Builder();
	}

	public async runPreScripts(requestId: string, stateAccess: StateAccess, auditLog: AuditLog = []) {
		const data = stateAccess.getState();
		const request = data.requests[requestId];
		const endpointId = request.endpointId;
		const endpoint = data.endpoints[endpointId];
		const service = data.services[endpoint.serviceId];
		const scriptObjs = { service, endpoint, request };
		const preRequestScripts = data.settings.scriptRunnerStrategy.pre.map((strat) => ({
			script: scriptObjs[strat]?.preRequestScript,
			name: `pre${capitalizeWord(strat)}Script` as const,
			id: scriptObjs[strat]?.id,
		}));
		for (const preRequestScript of preRequestScripts) {
			const res = (await this.runScript(preRequestScript.script, requestId, stateAccess, undefined, {
				log: auditLog,
				scriptType: preRequestScript.name,
				associatedId: preRequestScript.id,
			})) as {
				error: SprocketError;
			};
			// if an error, return it
			if (res?.error) {
				return res.error;
			}
		}
	}

	public async runPostScripts(
		requestId: string,
		stateAccess: StateAccess,
		response: EndpointResponse,
		auditLog: AuditLog = [],
	) {
		const data = stateAccess.getState();
		const request = data.requests[requestId];
		const endpoint = data.endpoints[request.endpointId];
		const service = data.services[endpoint.serviceId];
		const scriptObjs = { service, endpoint, request };
		const postRequestScripts = data.settings.scriptRunnerStrategy.post.map((strat) => ({
			script: scriptObjs[strat]?.postRequestScript,
			name: `post${capitalizeWord(strat)}Script` as const,
			id: scriptObjs[strat]?.id,
		}));
		for (const postRequestScript of postRequestScripts) {
			const res = (await this.runScript(postRequestScript.script, requestId, stateAccess, response, {
				log: auditLog,
				scriptType: postRequestScript.name,
				associatedId: postRequestScript.id,
			})) as {
				error: SprocketError;
			};
			// if an error, return it
			if (res?.error) {
				return res.error;
			}
		}
	}

	private async parseRequestForEnvironmentOverrides(request: EndpointRequest) {
		if (request.bodyType === 'none' || request.body == undefined) {
			return undefined;
		}
		if (request.rawType === 'JSON' || request.rawType === 'Yaml') {
			return yaml.load(request.body as string) as Record<string, unknown>;
		}
		if (request.rawType === 'XML') {
			return (await xmlParse.parseStringPromise(request.body)) as Record<string, unknown>;
		}
		return request.body as Record<string, unknown> | undefined;
	}

	private parseRequestForNetworkCall(
		request: EndpointRequest,
		parsedBody: Record<string, unknown> | unknown[] | string | undefined,
	) {
		if (parsedBody == undefined) {
			return undefined;
		}
		const category = getRequestBodyCategory(request.bodyType);
		if (request.rawType === 'JSON' || category === 'table') {
			return JSON.stringify(parsedBody as Record<string, unknown>);
		}
		if (request.rawType === 'Yaml') {
			return yaml.dump(parsedBody, { skipInvalid: true });
		}
		if (request.rawType === 'XML') {
			// convert to xml
			return this.xmlBuilder.buildObject(parsedBody);
		}
		return parsedBody as string;
	}

	public async sendRequest(requestId: string, data: WorkspaceData, auditLog: AuditLog = []) {
		const envValues = getEnvValuesFromData(data, requestId);
		const request = data.requests[requestId];
		const endpoint = data.endpoints[request.endpointId];
		const service = data.services[endpoint.serviceId];
		const unparsedUrl = `${service.baseUrl}${endpoint.url}`;
		const url = EnvironmentContextResolver.resolveVariablesForString(unparsedUrl, envValues);
		let body: Record<string, unknown> | unknown[] | undefined = await this.parseRequestForEnvironmentOverrides(request);
		if (body != undefined && typeof body != 'string') {
			body = EnvironmentContextResolver.resolveVariablesForMappedObject(body, envValues);
		}
		const headers = new OrderedKeyValuePairs();
		log.info(`Resolving endpoint headers ${JSON.stringify(endpoint.baseHeaders)}`);
		// endpoint headers and then request headers
		endpoint.baseHeaders.forEach((header) => {
			if (header.value == null) return;
			const parsedKey = EnvironmentContextResolver.resolveVariablesForString(header.key, envValues);
			headers.set(parsedKey, EnvironmentContextResolver.resolveVariablesForString(header.value, envValues));
		});
		request.headers.forEach((header) => {
			if (header.value == null) return;
			const parsedKey = EnvironmentContextResolver.resolveVariablesForString(header.key, envValues);
			headers.set(parsedKey, EnvironmentContextResolver.resolveVariablesForString(header.value, envValues));
		});

		const fullQueryParams = new OrderedKeyValuePairs(endpoint.baseQueryParams, request.queryParams);
		let queryParamStr = queryParamsToString(fullQueryParams.toArray(), true, (text) =>
			EnvironmentContextResolver.resolveVariablesForString(text, envValues),
		);
		if (queryParamStr) {
			queryParamStr = `?${queryParamStr}`;
		}

		const networkRequestBodyText = this.parseRequestForNetworkCall(request, body) ?? '';
		let networkBody: Body | undefined;
		const category = getRequestBodyCategory(request.bodyType);
		if (category === 'table') {
			if (request.bodyType === 'x-www-form-urlencoded') {
				networkBody = Body.form(body as Record<string, string>);
			} else {
				networkBody = Body.json(body as Record<string, string>);
			}
		} else if (category !== 'none') {
			networkBody = Body.text(networkRequestBodyText);
			// auto-set content type if not already set
			if (headers.get(CONTENT_TYPE) == undefined) {
				headers.set(CONTENT_TYPE, rawBodyTypeToMime(request.rawType));
			}
		} else {
			networkBody = undefined;
		}

		auditLogManager.addToAuditLog(auditLog, 'before', 'request', request?.id);

		const networkRequest: NetworkFetchRequest = {
			url: `${url}${queryParamStr}`,
			method: endpoint.verb,
			body: networkRequestBodyText,
			headers: headers.toObject(),
			dateTime: new Date().getTime(),
			bodyType: request.rawType,
		};

		const networkCall = fetch(networkRequest.url, {
			method: networkRequest.method,
			body: networkBody,
			headers: networkRequest.headers,
			responseType: ResponseType.Text,
		});

		const res: Awaited<ReturnType<typeof fetch>> = await asyncCallWithTimeout(
			networkCall,
			data.settings.timeoutDurationMS,
		);
		auditLogManager.addToAuditLog(auditLog, 'after', 'request', request?.id);
		const responseText = res.data as string;
		const response = {
			statusCode: res.status,
			headers: toKeyValuePairs(res.headers),
			bodyType: this.headersContentTypeToBodyType(res.headers['content-type']),
			body: responseText,
			dateTime: new Date().getTime(),
		};
		return { response, networkRequest };
	}

	public async runScript(
		script: string | undefined,
		requestId: string,
		stateAccess: StateAccess,
		response?: EndpointResponse | undefined,
		auditInfo?: {
			log: AuditLog;
			scriptType: Exclude<RequestEvent['eventType'], 'request'>;
			associatedId: string;
		},
	): Promise<unknown | { error: string }> {
		if (script) {
			const result = await scriptRunnerManager.runTypescriptWithSprocketContext(
				script,
				requestId,
				stateAccess,
				response,
				auditInfo,
			);
			return result;
		}
	}

	private headersContentTypeToBodyType(contentType: string | null): RawBodyType {
		let bodyType: RawBodyType = 'Text';
		if (contentType == null) {
			return bodyType;
		}
		RawBodyTypes.forEach((rawBodyType) => {
			if (contentType.toLowerCase().includes(rawBodyType.toLowerCase())) {
				bodyType = rawBodyType;
			}
		});
		return bodyType;
	}
}

export const networkRequestManager = NetworkRequestManager.INSTANCE;
