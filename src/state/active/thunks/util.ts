import { v4 } from 'uuid';
import {
	createEmptyEnvironment,
	Endpoint,
	EndpointRequest,
	Environment,
	Service,
} from '../../../types/application-data/application-data';

export function createNewRequestObject(endpointId: string): EndpointRequest {
	return {
		name: 'New Request',
		headers: [],
		queryParams: [],
		body: undefined,
		bodyType: 'none',
		rawType: undefined,
		environmentOverride: createEmptyEnvironment(),
		endpointId: endpointId,
		id: v4(),
		history: [],
	} satisfies EndpointRequest;
}

export function createNewEndpointObject(serviceId: string): Endpoint {
	return {
		url: '',
		verb: 'GET',
		baseHeaders: [],
		name: 'New Endpoint',
		baseQueryParams: [],
		description: 'This is a new endpoint',
		serviceId,
		requestIds: [],
		id: v4(),
		defaultRequest: null,
	};
}

export function createNewServiceObject(): Service {
	return {
		name: 'New Service',
		description: 'This is a new service',
		version: '1.0.0',
		baseUrl: '',
		localEnvironments: {},
		endpointIds: [],
		id: v4(),
	};
}

export function createNewEnvironmentObject(): Environment {
	return {
		name: 'New Environment',
		id: v4(),
		values: {},
	};
}
