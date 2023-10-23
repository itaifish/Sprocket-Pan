import {
	ApplicationData,
	EndpointRequest,
	RawBodyType,
	RawBodyTypes,
} from '../types/application-data/application-data';
import { log } from '../utils/logging';
import { applicationDataManager } from './ApplicationDataManager';
import { environmentContextResolver } from './EnvironmentContextResolver';

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
			const url = environmentContextResolver.resolveVariablesForString(unparsedUrl, data, endpoint.serviceId);
			let body = request.bodyType === 'none' ? undefined : request.body ? JSON.stringify(request.body) : undefined;
			if (body) {
				body = environmentContextResolver.resolveVariablesForString(body, data, endpoint.serviceId);
			}
			const headers: Record<string, string> = {};
			Object.keys(request.headers).forEach((headerKey) => {
				const parsedKey = environmentContextResolver.resolveVariablesForString(headerKey, data, endpoint.serviceId);
				headers[parsedKey] = environmentContextResolver.resolveVariablesForString(
					request.headers[headerKey],
					data,
					endpoint.serviceId,
				);
			});
			const res = await fetch(url, {
				method: endpoint.verb,
				body,
				headers: headers,
			});

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
