import { ApplicationData, Endpoint, EndpointRequest, Service } from '../types/application-data/application-data';
import { log } from './logging';

export function filterApplicationDataServicesBySearchTerm(searchText: string, services: ApplicationData['services']) {
	const searchUncased = searchText.toLocaleLowerCase();
	if (searchText === '') {
		return services;
	}
	// const filteredServices: Record<string, Service> = {};
	// serviceLoop: for (const service of Object.values(services)) {
	// 	const serviceProperties = [
	// 		'name',
	// 		'description',
	// 		'baseUrl',
	// 		'version',
	// 	] as const satisfies readonly (keyof Service)[];
	// 	for (const property of serviceProperties) {
	// 		if (service[property].toLocaleLowerCase().includes(searchUncased)) {
	// 			log.trace(`${service.name}.${property} matches ${searchText}`);
	// 			filteredServices[service.name] = service;
	// 			continue serviceLoop;
	// 		}
	// 	}
	// 	const filteredService: Service = { ...service, endpoints: {} };
	// 	endpointLoop: for (const endpoint of Object.values(service.endpoints)) {
	// 		const endpointProperties = ['description', 'name', 'verb', 'url'] as const satisfies readonly (keyof Endpoint)[];
	// 		for (const property of endpointProperties) {
	// 			if (endpoint[property].toLocaleLowerCase().includes(searchUncased)) {
	// 				filteredService.endpoints[endpoint.name] = endpoint;
	// 				continue endpointLoop;
	// 			}
	// 		}
	// 		const filteredEndpoint: Endpoint = { ...endpoint, requests: {} };
	// 		Object.values(endpoint.requests).forEach((request) => {
	// 			const nameMatches = request.name.toLocaleLowerCase().includes(searchUncased);
	// 			const bodyStr =
	// 				typeof request.body === 'string'
	// 					? request.body
	// 					: request.body != undefined
	// 					? JSON.stringify([...request.body])
	// 					: '';
	// 			const bodyMatches = bodyStr.toLocaleLowerCase().includes(searchUncased);
	// 			if (nameMatches || bodyMatches) {
	// 				filteredEndpoint.requests[request.name] = request;
	// 			}
	// 		});
	// 		if (Object.keys(filteredEndpoint.requests).length != 0) {
	// 			filteredService.endpoints[endpoint.name] = filteredEndpoint;
	// 		}
	// 	}
	// 	if (Object.keys(filteredService.endpoints).length != 0) {
	// 		filteredServices[filteredService.name] = filteredService;
	// 	}
	// }

	// return filteredServices;
	return services;
}
