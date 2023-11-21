import { EndpointResponse, RawBodyType, RawBodyTypes } from '../types/application-data/application-data';
import { queryParamsToStringReplaceVars } from '../utils/application';
import { log } from '../utils/logging';
import { applicationDataManager } from './ApplicationDataManager';
import { environmentContextResolver } from './EnvironmentContextResolver';
import ts from 'typescript';
import { getScriptInjectionCode } from './ScriptInjectionManager';
import { Constants } from '../utils/constants';
import { asyncCallWithTimeout, evalAsync } from '../utils/functions';
import { Body, ResponseType, fetch } from '@tauri-apps/api/http';

class NetworkRequestManager {
	public static readonly INSTANCE = new NetworkRequestManager();

	private constructor() {}

	public async sendRequest(requestId: string): Promise<string | null> {
		try {
			let data = applicationDataManager.getApplicationData();
			let request = data.requests[requestId];
			const endpointId = request.endpointId;
			let endpoint = data.endpoints[endpointId];
			let service = data.services[endpoint.serviceId];
			const unparsedUrl = `${service.baseUrl}${endpoint.url}`;
			// Run pre-request scripts
			let scriptObjs = { service, endpoint, request };
			const preRequestScripts = data.settings.scriptRunnerStrategy.pre.map(
				(strat) => scriptObjs[strat]?.preRequestScript,
			);
			for (const preRequestScript of preRequestScripts) {
				const res = await this.runScript(preRequestScript, requestId);
				// if an error, return it
				if (res) {
					return res;
				}
			}
			// re-grab application data now that scripts have ran
			data = applicationDataManager.getApplicationData();
			request = data.requests[requestId];
			endpoint = data.endpoints[endpointId];
			service = data.services[endpoint.serviceId];
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
			// endpoint headers and then request headers
			Object.keys(endpoint.baseHeaders).forEach((headerKey) => {
				const parsedKey = environmentContextResolver.resolveVariablesForString(
					headerKey,
					data,
					endpoint.serviceId,
					request.id,
				);
				headers[parsedKey] = environmentContextResolver.resolveVariablesForString(
					endpoint.baseHeaders[headerKey],
					data,
					endpoint.serviceId,
					request.id,
				);
			});
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

			const networkRequest = {
				url: `${url}${queryParamStr}`,
				method: endpoint.verb,
				body: body ?? {},
				headers: headers,
				dateTime: new Date(),
			};
			const networkCall = fetch(networkRequest.url, {
				method: networkRequest.method,
				body: body ? Body.json(body) : undefined,
				headers: networkRequest.headers,
				responseType: ResponseType.Text,
			});
			const res: Awaited<ReturnType<typeof fetch>> = await asyncCallWithTimeout(
				networkCall,
				data.settings.timeoutDurationMS,
			);
			const responseText = res.data as string;
			const response = {
				statusCode: res.status,
				headers: [...Object.entries(res.headers)].reduce<Record<string, string>>((obj, keyValuePair) => {
					obj[keyValuePair[0]] = keyValuePair[1];
					return obj;
				}, {}),
				bodyType: this.headersContentTypeToBodyType(res.headers['content-type']),
				body: responseText,
				dateTime: new Date(),
			};

			applicationDataManager.addResponseToHistory(request.id, networkRequest, response);
			// Run post-request scripts
			scriptObjs = { service, endpoint, request };
			const postRequestScripts = data.settings.scriptRunnerStrategy.post.map(
				(strat) => scriptObjs[strat]?.postRequestScript,
			);
			for (const postRequestScript of postRequestScripts) {
				const res = await this.runScript(postRequestScript, requestId, response);
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
		requestId: string,
		response?: EndpointResponse | undefined,
	): Promise<string | undefined> {
		if (script && script != '') {
			try {
				const sprocketPan = getScriptInjectionCode(requestId, response);
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
