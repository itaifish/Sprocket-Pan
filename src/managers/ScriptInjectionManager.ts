import ts from 'typescript';
import { updateEnvironment, updateRequest, updateService } from '../state/active/slice';
import { makeRequest } from '../state/active/thunks/requests';
import { StateAccess } from '../state/types';
import { EndpointResponse, Script } from '../types/application-data/application-data';
import { EnvironmentUtils, HeaderUtils, QueryParamUtils } from '../utils/data-utils';
import { evalAsync } from '../utils/functions';
import { AuditLog } from './AuditLogManager';
import { environmentContextResolver } from './EnvironmentContextResolver';

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
			const newEnv = structuredClone(data.environments[selectedEnvironment ?? '']);
			if (newEnv) {
				EnvironmentUtils.set(newEnv, key, value);
				dispatch(updateEnvironment(newEnv));
			}
		}
	};

	const setQueryParam = (key: string, value: string) => {
		const request = getRequest();
		const newQueryParams = structuredClone(request.queryParams);
		QueryParamUtils.add(newQueryParams, key, value);
		dispatch(updateRequest({ id: request.id, queryParams: newQueryParams }));
	};

	const setQueryParams = (key: string, values: string[]) => {
		const request = getRequest();
		const newQueryParams = structuredClone(request.queryParams);
		QueryParamUtils.set(newQueryParams, key, values);
		dispatch(updateRequest({ id: request.id, queryParams: newQueryParams }));
	};

	const setHeader = (key: string, value: string) => {
		const request = getRequest();
		const newHeaders = structuredClone(request.headers);
		HeaderUtils.set(newHeaders, key, value);
		dispatch(updateRequest({ id: request.id, headers: newHeaders }));
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
		await dispatch(makeRequest({ requestId, auditLog }));
		return data.requests[requestId].history[data.requests[requestId].history.length - 1]?.response;
	};

	const getRunnableScripts = () => {
		const data = getState();
		return Object.values(data.scripts).reduce(
			(previousValue: Record<string, () => Promise<unknown>>, currentValue: Script) => {
				return {
					...previousValue,
					[currentValue.scriptCallableName]: async () => {
						const addendum = currentValue.returnVariableName ? `\nreturn ${currentValue.returnVariableName}` : '';
						const jsScript = ts.transpile(currentValue.content);
						const result = await evalAsync(`${jsScript}${addendum}`);
						return result as unknown;
					},
				};
			},
			{},
		);
	};

	return {
		...getRunnableScripts(),
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
