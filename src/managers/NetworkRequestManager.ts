import {
	ApplicationData,
	EndpointRequest,
	EndpointResponse,
	RawBodyType,
	RawBodyTypes,
} from '../types/application-data/application-data';
import { queryParamsToStringReplaceVars } from '../utils/application';
import { log } from '../utils/logging';
import { applicationDataManager } from './ApplicationDataManager';
import { environmentContextResolver } from './EnvironmentContextResolver';
import ts from 'typescript';
import { getScriptInjectionCode } from './ScriptInjectionManager';
import { Constants } from '../utils/constants';
import { asyncCallWithTimeout, evalAsync } from '../utils/functions';
import { Body, ResponseType, fetch } from '@tauri-apps/api/http';

export type NetworkCallResponse = {
	responseText: string;
	contentType?: string | null;
};

class NetworkRequestManager {
	public static readonly INSTANCE = new NetworkRequestManager();

	private constructor() {}

	public async sendRequest(request: EndpointRequest, data: ApplicationData): Promise<string | null> {
		try {
			const endpointId = request.endpointId;
			const endpoint = data.endpoints[endpointId];
			const service = data.services[endpoint.serviceId];
			const unparsedUrl = `${service.baseUrl}${endpoint.url}`;
			// Run pre-request scripts
			const preRequestScripts = [service.preRequestScript, endpoint.preRequestScript, request.preRequestScript];
			for (const preRequestScript of preRequestScripts) {
				const res = await this.runScript(preRequestScript, request, data);
				// if an error, return it
				if (res) {
					return res;
				}
			}

			const url = environmentContextResolver.resolveVariablesForString(
				unparsedUrl,
				data,
				endpoint.serviceId,
				request.id,
			);
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
			const headers: Record<string, string> = {};
			Object.keys(request.headers).forEach((headerKey) => {
				const parsedKey = environmentContextResolver.resolveVariablesForString(
					headerKey,
					data,
					endpoint.serviceId,
					request.id,
				);
				headers[parsedKey] = environmentContextResolver.resolveVariablesForString(
					request.headers[headerKey],
					data,
					endpoint.serviceId,
					request.id,
				);
			});
			const fullQueryParams = { ...endpoint.baseQueryParams, ...request.queryParams };
			let queryParamStr = queryParamsToStringReplaceVars(fullQueryParams, (text) =>
				environmentContextResolver.resolveVariablesForString(text, data, endpoint.serviceId, request.id),
			);
			if (queryParamStr) {
				queryParamStr = `?${queryParamStr}`;
			}
			const networkCall = fetch(`${url}${queryParamStr}`, {
				method: endpoint.verb,
				body: body ? Body.json(body) : undefined,
				headers: headers,
				responseType: ResponseType.Text,
			});
			const res: Awaited<ReturnType<typeof fetch>> = await asyncCallWithTimeout(
				networkCall,
				Constants.networkRequestTimeoutMS,
			);
			const responseText = res.data as string;
			const response = {
				statusCode: res.status,
				headers: [...Object.entries(res.headers)].reduce<Record<string, string>>((obj, [keyValuePair]) => {
					obj[keyValuePair[0]] = keyValuePair[1];
					return obj;
				}, {}),
				bodyType: this.headersContentTypeToBodyType(res.headers['content-type']),
				body: responseText,
			};

			applicationDataManager.addResponseToHistory(request.id, response);
			// Run post-request scripts
			const postRequestScripts = [service.postRequestScript, endpoint.postRequestScript, request.postRequestScript];
			for (const postRequestScript of postRequestScripts) {
				const res = await this.runScript(postRequestScript, request, data, response);
				// if an error, return it
				if (res) {
					return res;
				}
			}
		} catch (e) {
			const errorStr = JSON.stringify(e, Object.getOwnPropertyNames(e));
			log.warn(errorStr);
			return errorStr;
		}
		return null;
	}

	private async runScript(
		script: string | undefined,
		request: EndpointRequest,
		data: ApplicationData,
		response?: EndpointResponse | undefined,
	): Promise<string | undefined> {
		if (script && script != '') {
			try {
				const sprocketPan = getScriptInjectionCode(request, data, response);
				const _this = globalThis as any;
				_this.sp = sprocketPan;
				_this.sprocketPan = sprocketPan;
				_this.fetch = fetch;
				const jsScript = ts.transpile(script);
				const scriptTask = evalAsync(jsScript);
				await asyncCallWithTimeout(scriptTask, Constants.scriptsTimeoutMS);
			} catch (e) {
				const errorStr = JSON.stringify(e, Object.getOwnPropertyNames(e));
				return JSON.stringify({
					...JSON.parse(errorStr),
					errorType: `Invalid ${response != undefined ? 'Post' : 'Pre'}-request Script`,
				});
			}
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
