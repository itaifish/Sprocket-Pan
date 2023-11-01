import { ApplicationData, EndpointRequest, EndpointResponse } from '../types/application-data/application-data';
import { applicationDataManager } from './ApplicationDataManager';
import { environmentContextResolver } from './EnvironmentContextResolver';

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
			// applicationDataManager.update('service', endpoint.serviceId, {e});
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

	const readonlyData = structuredClone(data);
	const latestResponse =
		response ?? (request.history && request.history.length > 0) ? request.history[request.history.length - 1] : null;
	return {
		setEnvironmentVariable,
		setQueryParam,
		setQueryParams,
		setHeader,
		getEnvironment,
		data: readonlyData,
		response: latestResponse,
	};
}
