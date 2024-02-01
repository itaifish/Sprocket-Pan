import { EndpointResponse } from '../types/application-data/application-data';
import { EnvironmentUtils, HeaderUtils, QueryParamUtils } from '../utils/data-utils';
import { applicationDataManager } from './ApplicationDataManager';
import { AuditLog } from './AuditLogManager';
import { environmentContextResolver } from './EnvironmentContextResolver';
import { networkRequestManager } from './NetworkRequestManager';

export function getScriptInjectionCode(requestId: string, response?: EndpointResponse, auditLog?: AuditLog) {
	const getRequestAndData = () => {
		const data = applicationDataManager.getApplicationData();
		return {
			request: data.requests[requestId],
			data,
		};
	};

	const setEnvironmentVariable = (key: string, value: string, level: 'request' | 'service' | 'global' = 'request') => {
		const { data, request } = getRequestAndData();
		if (level === 'request') {
			EnvironmentUtils.set(request.environmentOverride, key, value);
			applicationDataManager.update('request', request.id, {
				environmentOverride: { ...request.environmentOverride },
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
				EnvironmentUtils.set(service.localEnvironments[selectedEnvironment], key, value);
				applicationDataManager.update('service', endpoint.serviceId, {
					localEnvironments: {
						...service.localEnvironments,
						[selectedEnvironment]: { ...service.localEnvironments[selectedEnvironment] },
					},
				});
			}
		} else if (level === 'global') {
			const selectedEnvironment = data.selectedEnvironment;
			if (selectedEnvironment) {
				applicationDataManager.update('environment', selectedEnvironment, { [key]: value });
			}
		}
	};

	const setQueryParam = (key: string, value: string) => {
		const { request } = getRequestAndData();
		QueryParamUtils.add(request.queryParams, key, value);
		applicationDataManager.update('request', request.id, {
			queryParams: { ...request.queryParams },
		});
	};

	const setQueryParams = (key: string, values: string[]) => {
		const { request } = getRequestAndData();
		QueryParamUtils.set(request.queryParams, key, values);
		applicationDataManager.update('request', request.id, {
			queryParams: { ...request.queryParams },
		});
	};

	const setHeader = (key: string, value: string) => {
		const { request } = getRequestAndData();
		HeaderUtils.set(request.headers, key, value);
		applicationDataManager.update('request', request.id, {
			headers: { ...request.headers },
		});
	};

	const getEnvironment = () => {
		const { data, request } = getRequestAndData();
		const endpoint = data.endpoints[request.endpointId];
		const serviceId = endpoint?.serviceId;
		return environmentContextResolver.buildEnvironmentVariables(data, serviceId, request.id) as Record<string, string>;
	};

	const sendRequest = async (requestId: string) => {
		const { data } = getRequestAndData();
		await networkRequestManager.sendRequest(requestId, auditLog);
		return data.requests[requestId].history[data.requests[requestId].history.length - 1]?.response;
	};

	return {
		setEnvironmentVariable,
		setQueryParam,
		setQueryParams,
		setHeader,
		getEnvironment,
		sendRequest,
		get data() {
			return structuredClone(applicationDataManager.getApplicationData());
		},
		get activeRequest() {
			return structuredClone(applicationDataManager.getApplicationData().requests[requestId]);
		},
		get response() {
			const { request } = getRequestAndData();
			const latestResponse =
				response ?? (request.history && request.history.length > 0)
					? request.history[request.history.length - 1]
					: null;
			return latestResponse;
		},
	};
}
