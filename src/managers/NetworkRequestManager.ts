import { ApplicationData, EndpointRequest } from '../types/application-data/application-data';
import { environmentContextResolver } from './EnvironmentContextResolver';

export type NetworkCallResponse = {
	responseText: string;
	contentType?: string | null;
};

class NetworkRequestManager {
	public static readonly INSTANCE = new NetworkRequestManager();

	private constructor() {}

	public async sendRequest(request: EndpointRequest, data: ApplicationData): Promise<NetworkCallResponse> {
		try {
			const endpointId = request.endpointId;
			const endpoint = data.endpoints[endpointId];
			const service = data.services[endpoint.serviceId];
			const unparsedUrl = `${service.baseUrl}${endpoint.url}`;
			const url = environmentContextResolver.resolveVariablesForString(unparsedUrl, data, endpoint.serviceId);
			const res = await fetch(url, {
				method: endpoint.verb,
				body: request.body ? JSON.stringify(request.body) : undefined,
			});

			const responseText = await (await res.blob()).text();
			return { responseText, contentType: res.headers.get('content-type') };
		} catch (e) {
			return { responseText: JSON.stringify(e, Object.getOwnPropertyNames(e)), contentType: 'application/json' };
		}
	}
}

export const networkRequestManager = NetworkRequestManager.INSTANCE;
