import {
	WorkspaceData,
	Endpoint,
	EndpointRequest,
	Environment,
	Script,
	Service,
} from '../types/application-data/application-data';
import { log } from './logging';

function cleanText(text: string) {
	return text?.toLocaleLowerCase() ?? '';
}

function envMatches(env: Environment, text: string) {
	return cleanText(env.name).includes(text);
}

function scriptMatches(script: Script, text: string) {
	return cleanText(script.name).includes(text);
}

const serviceProperties = ['name', 'description', 'baseUrl', 'version'] as const satisfies readonly (keyof Service)[];
function serviceMatches(service: Service, text: string) {
	return serviceProperties.find((property) => cleanText(service[property]).includes(text));
}

const endpointProperties = ['description', 'name', 'verb', 'url'] as const satisfies readonly (keyof Endpoint)[];
function endpointMatches(endpoint: Endpoint, text: string) {
	return endpointProperties.find((property) => cleanText(endpoint[property]).includes(text));
}

function requestMatches(request: EndpointRequest, text: string) {
	if (cleanText(request.name).includes(text)) {
		return 'name';
	}
	const bodyStr =
		typeof request.body === 'string' ? request.body : request.body != undefined ? JSON.stringify(request.body) : '';
	if (cleanText(bodyStr).includes(text)) {
		return 'body';
	}
}

type DataSearchContext = Pick<WorkspaceData, 'endpoints' | 'requests' | 'services'>;

export function getValidIdsFromSearchTerm(
	searchText: string,
	{ services, requests, endpoints }: DataSearchContext,
): Set<string> {
	const text = cleanText(searchText);
	const validIds = new Set<string>();
	for (const service of Object.values(services)) {
		const matchedProperty = serviceMatches(service, text);
		if (matchedProperty != null) {
			log.trace(`Service ${service.name}.${matchedProperty} matches ${searchText}`);
			validIds.add(service.id);
			service.endpointIds.forEach((endpointId) => {
				validIds.add(endpointId);
				const endpoint = endpoints[endpointId];
				endpoint.requestIds.forEach((requestId) => {
					validIds.add(requestId);
				});
			});
		}
		for (const endpointId of service.endpointIds) {
			const endpoint = endpoints[endpointId];
			const matchedProperty = endpointMatches(endpoint, text);
			if (matchedProperty != null) {
				log.trace(`Endpoint ${endpoint.name}.${matchedProperty} matches ${searchText}`);
				validIds.add(endpointId);
				validIds.add(service.id);
				endpoint.requestIds.forEach((requestId) => {
					validIds.add(requestId);
				});
			}
			for (const requestId of endpoint.requestIds) {
				const request = requests[requestId];
				const matchedProperty = requestMatches(request, text);
				if (matchedProperty != null) {
					log.trace(`Request ${request.name}.${matchedProperty} matches ${searchText}`);
					validIds.add(service.id);
					validIds.add(endpointId);
					validIds.add(request.id);
				}
			}
		}
	}

	return validIds;
}

export function searchScripts(scripts: Record<string, Script>, text: string): string[] {
	text = cleanText(text);
	return Object.keys(scripts).filter((scriptId) => scriptMatches(scripts[scriptId], text));
}

export function searchEnvironments(environments: Record<string, Environment>, text: string): string[] {
	text = cleanText(text);
	return Object.keys(environments).filter((envId) => envMatches(environments[envId], text));
}
