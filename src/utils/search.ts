import { ApplicationData, Endpoint, Service } from '../types/application-data/application-data';
import { log } from './logging';

class AlwaysYesSet<T> extends Set<T> {
	constructor() {
		super();
	}
	has(_value: T) {
		return true;
	}
}

export function getValidIdsFromSearchTerm(searchText: string, data: ApplicationData): Set<string> {
	const searchUncased = searchText.toLocaleLowerCase();
	if (searchText === '') {
		return new AlwaysYesSet<string>();
	}
	const validIds = new Set<string>();
	serviceLoop: for (const service of Object.values(data.services)) {
		const serviceProperties = [
			'name',
			'description',
			'baseUrl',
			'version',
		] as const satisfies readonly (keyof Service)[];
		for (const property of serviceProperties) {
			if (service[property].toLocaleLowerCase().includes(searchUncased)) {
				log.trace(`${service.name}.${property} matches ${searchText}`);
				validIds.add(service.id);
				service.endpointIds.forEach((endpointId) => {
					validIds.add(endpointId);
					const endpoint = data.endpoints[endpointId];
					endpoint.requestIds.forEach((requestId) => {
						validIds.add(requestId);
					});
				});
				continue serviceLoop;
			}
		}
		endpointLoop: for (const endpointId of Object.values(service.endpointIds)) {
			const endpoint = data.endpoints[endpointId];
			const endpointProperties = ['description', 'name', 'verb', 'url'] as const satisfies readonly (keyof Endpoint)[];
			for (const property of endpointProperties) {
				if (endpoint[property].toLocaleLowerCase().includes(searchUncased)) {
					validIds.add(endpointId);
					validIds.add(service.id);
					endpoint.requestIds.forEach((requestId) => {
						validIds.add(requestId);
					});
					continue endpointLoop;
				}
			}
			Object.values(endpoint.requestIds).forEach((requestId) => {
				const request = data.requests[requestId];
				const nameMatches = request.name.toLocaleLowerCase().includes(searchUncased);
				const bodyStr =
					typeof request.body === 'string'
						? request.body
						: request.body != undefined
						? JSON.stringify(request.body)
						: '';
				const bodyMatches = bodyStr.toLocaleLowerCase().includes(searchUncased);
				if (nameMatches || bodyMatches) {
					validIds.add(service.id);
					validIds.add(endpointId);
					validIds.add(request.id);
				}
			});
		}
	}

	for (const env of Object.values(data.environments)) {
		if (env.__name.toLocaleLowerCase().includes(searchUncased)) {
			validIds.add(env.__id);
		}
	}

	return validIds;
}
