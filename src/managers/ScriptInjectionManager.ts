import { updateEnvironment, updateRequest, updateService } from '../state/active/slice';
import { StateAccess } from '../state/types';
import { EndpointResponse } from '../types/application-data/application-data';
import { EnvironmentUtils, HeaderUtils, QueryParamUtils } from '../utils/data-utils';
import { AuditLog } from './AuditLogManager';
import { environmentContextResolver } from './EnvironmentContextResolver';
import { networkRequestManager } from './NetworkRequestManager';

export function getScriptInjectionCode(
	requestId: string,
	{ getState, dispatch }: StateAccess,
	response?: EndpointResponse,
	auditLog?: AuditLog,
) {
	const getRequest = () => getState().requests[requestId];

	const setEnvironmentVariable = (key: string, value: string, level: 'request' | 'service' | 'global' = 'request') => {
		const data = getState();
		const request = getRequest();
		if (level === 'request') {
			const newEnv = structuredClone(request.environmentOverride);
			EnvironmentUtils.set(newEnv, key, value);
			dispatch(updateRequest({ id: request.id, environmentOverride: newEnv }));
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
				const newEnv = structuredClone(service.localEnvironments[selectedEnvironment]);
				EnvironmentUtils.set(newEnv, key, value);
				dispatch(
					updateService({
						id: endpoint.serviceId,
						localEnvironments: {
							...service.localEnvironments,
							[selectedEnvironment]: newEnv,
						},
					}),
				);
			}
		} else if (level === 'global') {
			const selectedEnvironment = data.selectedEnvironment;
			if (selectedEnvironment) {
				dispatch(
					updateEnvironment({
						__id: selectedEnvironment,
						[key]: value,
					}),
				);
			}
		}
	};

	const setQueryParam = (key: string, value: string) => {
		const request = getRequest();
		QueryParamUtils.add(request.queryParams, key, value);
		dispatch(updateRequest({ id: request.id, queryParams: { ...request.queryParams } }));
	};

	const setQueryParams = (key: string, values: string[]) => {
		const request = getRequest();
		QueryParamUtils.set(request.queryParams, key, values);
		dispatch(updateRequest({ id: request.id, queryParams: { ...request.queryParams } }));
	};

	const setHeader = (key: string, value: string) => {
		const request = getRequest();
		HeaderUtils.set(request.headers, key, value);
		dispatch(updateRequest({ id: request.id, headers: { ...request.headers } }));
	};

	const getEnvironment = () => {
		const data = getState();
		const request = getRequest();
		const endpoint = data.endpoints[request.endpointId];
		const serviceId = endpoint?.serviceId;
		return environmentContextResolver.buildEnvironmentVariables(data, serviceId, request.id) as Record<string, string>;
	};

	const sendRequest = async (requestId: string) => {
		const data = getState();
		await networkRequestManager.sendRequest(requestId, data, auditLog);
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
			return structuredClone(getState());
		},
		get activeRequest() {
			return structuredClone(getState().requests[requestId]);
		},
		get response() {
			const request = getRequest();
			const latestResponse =
				response ?? (request.history && request.history.length > 0)
					? request.history[request.history.length - 1]
					: null;
			return latestResponse;
		},
	};
}
