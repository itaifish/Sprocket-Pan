import {
	ApplicationData,
	EndpointRequest,
	RawBodyType,
	RawBodyTypes,
} from '../types/application-data/application-data';
import { queryParamsToStringReplaceVars } from '../utils/application';
import { log } from '../utils/logging';
import { applicationDataManager } from './ApplicationDataManager';
import { environmentContextResolver } from './EnvironmentContextResolver';
import ts from 'typescript';
import { getPreScriptInjectionCode } from './ScriptInjectionManager';
import { Constants } from '../utils/constants';
import { asyncCallWithTimeout } from '../utils/functions';
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
			// Run pre-request script
			if (request.preRequestScript && request.preRequestScript != '') {
				try {
					const sprocketPan = getPreScriptInjectionCode(request, data);
					const _this = globalThis as any;
					_this.sp = sprocketPan;
					_this.sprocketPan = sprocketPan;
					const jsScript = ts.transpile(request.preRequestScript);
					const preRequestScriptTask = Object.getPrototypeOf(async function () {}).constructor(jsScript)();
					await asyncCallWithTimeout(preRequestScriptTask, Constants.scriptsTimeoutMS);
				} catch (e) {
					const errorStr = JSON.stringify(e, Object.getOwnPropertyNames(e));
					return JSON.stringify({ ...JSON.parse(errorStr), errorType: 'Invalid Pre-request Script' });
				}
			}
			const url = environmentContextResolver.resolveVariablesForString(
				unparsedUrl,
				data,
				endpoint.serviceId,
				request.id,
			);
			let body = request.bodyType === 'none' ? undefined : request.body ? JSON.stringify(request.body) : undefined;
			if (body) {
				body = environmentContextResolver.resolveVariablesForString(body, data, endpoint.serviceId, request.id);
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
			let queryParamStr = queryParamsToStringReplaceVars(request.queryParams, (text) =>
				environmentContextResolver.resolveVariablesForString(text, data, endpoint.serviceId, request.id),
			);
			if (queryParamStr) {
				queryParamStr = `?${queryParamStr}`;
			}

			const networkCall = fetch(`${url}${queryParamStr}`, {
				method: endpoint.verb,
				body,
				headers: headers,
			});
			const res = await asyncCallWithTimeout(networkCall, Constants.networkRequestTimeoutMS);
			const responseText = await (await res.blob()).text();
			applicationDataManager.addResponseToHistory(request.id, {
				statusCode: res.status,
				headers: [...res.headers.entries()].reduce<Record<string, string>>((obj, [keyValuePair]) => {
					obj[keyValuePair[0]] = keyValuePair[1];
					return obj;
				}, {}),
				bodyType: this.headersContentTypeToBodyType(res.headers.get('content-type')),
				body: responseText,
			});
		} catch (e) {
			const errorStr = JSON.stringify(e, Object.getOwnPropertyNames(e));
			log.warn(errorStr);
			return errorStr;
		}
		return null;
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
