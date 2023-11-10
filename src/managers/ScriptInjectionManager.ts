import { ApplicationData, EndpointRequest, EndpointResponse } from '../types/application-data/application-data';
import { applicationDataManager } from './ApplicationDataManager';
import { environmentContextResolver } from './EnvironmentContextResolver';
import { networkRequestManager } from './NetworkRequestManager';

export function getScriptInjectionCode(request: EndpointRequest, data: ApplicationData, response?: EndpointResponse) {
	const setEnvironmentVariable = (key: string, value: string, level: 'request' | 'service' | 'global' = 'request') => {
		if (level === 'request') {
			applicationDataManager.update('request', request.id, {
				environmentOverride: { ...request.environmentOverride, [key]: value },
			});
		} else if (level === 'service') {
			const endpoint = data.endpoints[request.endpointId];
			if (!endpoint) {
				return;
			}
			const service = data.services[endpoint.serviceId];
			if (!service) {
				return;
			}
			const selectedEnvironment = service.selectedEnvironment;
			if (selectedEnvironment) {
				// TODO: Deal with updating service-level environments in application data manager - also let it be edited within service
				// applicationDataManager.update('service', endpoint.serviceId, {localEnvironments: {...service.localEnvironments, []} })
			}
		} else if (level === 'global') {
			const selectedEnvironment = data.selectedEnvironment;
			if (selectedEnvironment) {
				applicationDataManager.update('environment', selectedEnvironment, { [key]: value });
			}
		}
	};

	const setQueryParam = (key: string, value: string) => {
		const newValue = request.queryParams[key] ? [...request.queryParams[key], value] : [value];
		applicationDataManager.update('request', request.id, {
			queryParams: { ...request.queryParams, [key]: newValue },
		});
	};

	const setQueryParams = (key: string, values: string[]) => {
		applicationDataManager.update('request', request.id, {
			queryParams: { ...request.queryParams, [key]: values },
		});
	};

	const setHeader = (key: string, value: string) => {
		applicationDataManager.update('request', request.id, {
			headers: { ...request.headers, [key]: value },
		});
	};

	const getEnvironment = () => {
		const endpoint = data.endpoints[request.endpointId];
		const serviceId = endpoint?.serviceId;
		return environmentContextResolver.buildEnvironmentVariables(data, serviceId, request.id) as Record<string, string>;
	};

	const sendRequest = async (requestId: string) => {
		const request = data.requests[requestId];
		if (request) {
			await networkRequestManager.sendRequest(request, data);
		}
		return data.requests[requestId].history[data.requests[requestId].history.length - 1]?.response;
	};

	const readonlyData = structuredClone(data);
	const latestResponse =
		response ?? (request.history && request.history.length > 0) ? request.history[request.history.length - 1] : null;
	return {
		setEnvironmentVariable,
		setQueryParam,
		setQueryParams,
		setHeader,
		getEnvironment,
		sendRequest,
		data: readonlyData,
		response: latestResponse,
	};
}
