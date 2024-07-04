import {
	ApplicationData,
	EMPTY_HEADERS,
	EndpointResponse,
	RawBodyType,
	RawBodyTypes,
	SPHeaders,
} from '../types/application-data/application-data';
import { queryParamsToStringReplaceVars } from '../utils/application';
import { environmentContextResolver } from './EnvironmentContextResolver';
import { asyncCallWithTimeout } from '../utils/functions';
import { Body, ResponseType, fetch } from '@tauri-apps/api/http';
import { HeaderUtils } from '../utils/data-utils';
import { capitalizeWord } from '../utils/string';
import { AuditLog, RequestEvent, auditLogManager } from './AuditLogManager';
import { StateAccess } from '../state/types';
import { scriptRunnerManager } from './ScriptRunnerManager';
import { SprocketError } from '../types/state/state';

class NetworkRequestManager {
	public static readonly INSTANCE = new NetworkRequestManager();

	private constructor() {}

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

	public async sendRequest(requestId: string, data: ApplicationData, auditLog: AuditLog = []) {
		const request = data.requests[requestId];
		const endpoint = data.endpoints[request.endpointId];
		const service = data.services[endpoint.serviceId];
		const unparsedUrl = `${service.baseUrl}${endpoint.url}`;
		const url = environmentContextResolver.resolveVariablesForString(unparsedUrl, data, endpoint.serviceId, request.id);
		let body =
			request.bodyType === 'none'
				? undefined
				: request.body
				? typeof request.body === 'string'
					? (JSON.parse(request.body) as Record<string, unknown>)
					: request.body
				: undefined;
		if (body) {
			body = environmentContextResolver.resolveVariablesForMappedObject(body, {
				data,
				serviceId: endpoint.serviceId,
				requestId: request.id,
			});
		}
		const headers: SPHeaders = structuredClone(EMPTY_HEADERS);
		// endpoint headers and then request headers
		endpoint.baseHeaders.__data.forEach((header) => {
			const parsedKey = environmentContextResolver.resolveVariablesForString(
				header.key,
				data,
				endpoint.serviceId,
				request.id,
			);
			HeaderUtils.set(
				headers,
				parsedKey,
				environmentContextResolver.resolveVariablesForString(
					endpoint.baseHeaders[header.key],
					data,
					endpoint.serviceId,
					request.id,
				),
			);
		});
		request.headers.__data.forEach((header) => {
			const parsedKey = environmentContextResolver.resolveVariablesForString(
				header.key,
				data,
				endpoint.serviceId,
				request.id,
			);
			HeaderUtils.set(
				headers,
				parsedKey,
				environmentContextResolver.resolveVariablesForString(
					request.headers[header.key],
					data,
					endpoint.serviceId,
					request.id,
				),
			);
		});
		const fullQueryParams = { ...endpoint.baseQueryParams, ...request.queryParams };
		let queryParamStr = queryParamsToStringReplaceVars(fullQueryParams, (text) =>
			environmentContextResolver.resolveVariablesForString(text, data, endpoint.serviceId, request.id),
		);
		if (queryParamStr) {
			queryParamStr = `?${queryParamStr}`;
		}

		const networkRequest = {
			url: `${url}${queryParamStr}`,
			method: endpoint.verb,
			body: body ?? {},
			headers: headers,
			dateTime: new Date().getTime(),
		};
		const { __data, ...headersToSend } = networkRequest.headers;
		auditLogManager.addToAuditLog(auditLog, 'before', 'request', request?.id);
		const networkCall = fetch(networkRequest.url, {
			method: networkRequest.method,
			body: body ? Body.json(body) : undefined,
			headers: headersToSend,
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
			headers: [...Object.entries(res.headers)].reduce<Record<string, string>>((obj, keyValuePair) => {
				obj[keyValuePair[0]] = keyValuePair[1];
				return obj;
			}, {}),
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
