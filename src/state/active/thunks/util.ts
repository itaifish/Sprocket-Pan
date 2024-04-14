import { v4 } from 'uuid';
import {
	EMPTY_ENVIRONMENT,
	EMPTY_HEADERS,
	EMPTY_QUERY_PARAMS,
	Endpoint,
	EndpointRequest,
	Environment,
	Service,
} from '../../../types/application-data/application-data';

export function createNewRequestObject(endpointId: string): EndpointRequest {
	const newId = v4();
	return {
		name: 'New Request',
		headers: structuredClone(EMPTY_HEADERS),
		queryParams: structuredClone(EMPTY_QUERY_PARAMS),
		body: undefined,
		bodyType: 'none',
		rawType: undefined,
		environmentOverride: structuredClone(EMPTY_ENVIRONMENT),
		endpointId: endpointId,
		id: newId,
		history: [],
	};
}

export function createNewEndpointObject(serviceId: string): Endpoint {
	const newId = v4();
	return {
		url: '',
		verb: 'GET',
		baseHeaders: structuredClone(EMPTY_HEADERS),
		name: 'New Endpoint',
		baseQueryParams: structuredClone(EMPTY_QUERY_PARAMS),
		description: 'This is a new endpoint',
		serviceId,
		requestIds: [],
		id: newId,
		defaultRequest: null,
	};
}

export function cloneEndpoint(endpoint: Endpoint, serviceId: string): Endpoint {
	return { ...structuredClone(endpoint), serviceId };
}

export function createNewServiceObject(): Service {
	const newId = v4();
	return {
		name: 'New Service',
		description: 'This is a new service',
		version: '1.0.0',
		baseUrl: '',
		localEnvironments: {},
		endpointIds: [],
		id: newId,
	};
}

export function createNewEnvironmentObject(): Omit<Environment, '__data'> {
	const newId = v4();
	return {
		__name: 'New Environment',
		__id: newId,
	};
}
