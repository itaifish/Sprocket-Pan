import { ApplicationData, Endpoint, EndpointRequest, Service } from '../types/application-data/application-data';
import { log } from './logging';

export function filterApplicationDataServicesBySearchTerm(searchText: string, services: ApplicationData['services']) {
	const searchUncased = searchText.toLocaleLowerCase();
	log.debug(`Filtering based on text "${searchText}"`);
	if (searchText === '') {
		return services;
	}
	const filteredServices: Record<string, Service> = {};
	Object.values(services).forEach((service) => {
		const serviceProperties = [
			'name',
			'description',
			'baseUrl',
			'version',
		] as const satisfies readonly (keyof Service)[];
		for (const property of serviceProperties) {
			if (service[property].toLocaleLowerCase().includes(searchUncased)) {
				filteredServices[service.name] = service;
				return;
			}
		}
		const filteredService: Service = { ...service, endpoints: {} };
		Object.values(service.endpoints).forEach((endpoint) => {
			const endpointProperties = ['description', 'name', 'verb', 'url'] as const satisfies readonly (keyof Endpoint)[];
			for (const property of endpointProperties) {
				if (endpoint[property].toLocaleLowerCase().includes(searchUncased)) {
					filteredService.endpoints[endpoint.name] = endpoint;
					return;
				}
			}
			const filteredEndpoint: Endpoint = { ...endpoint, requests: {} };
			Object.values(endpoint.requests).forEach((request) => {
				const nameMatches = request.name.toLocaleLowerCase().includes(searchUncased);
				const bodyStr =
					typeof request.body === 'string'
						? request.body
						: request.body != undefined
						? JSON.stringify([...request.body])
						: '';
				const bodyMatches = bodyStr.toLocaleLowerCase().includes(searchUncased);
				if (nameMatches || bodyMatches) {
					filteredEndpoint.requests[request.name] = request;
				}
			});
		});
		filteredServices[filteredService.name] = filteredService;
	});
	return filteredServices;
}
