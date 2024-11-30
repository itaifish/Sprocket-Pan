import { Update, updateEnvironment, updateRequest, updateService } from '../../state/active/slice';
import { makeRequest } from '../../state/active/thunks/requests';
import { StateAccess } from '../../state/types';
import { EndpointRequest, EndpointResponse, Script } from '../../types/application-data/application-data';
import { AuditLog, auditLogManager } from '../AuditLogManager';
import { EnvironmentContextResolver } from '../EnvironmentContextResolver';
import { scriptRunnerManager } from './ScriptRunnerManager';
import { http } from '@tauri-apps/api';
import { Body, HttpVerb } from '@tauri-apps/api/http';
import { KeyValuePair, OrderedKeyValuePairs } from '../../classes/OrderedKeyValuePairs';
import { getEnvValuesFromData } from '../../utils/application';

type HttpOptions = {
	method: HttpVerb;
	headers?: Record<string, unknown>;
	query?: Record<string, unknown>;
	body?: Record<string, unknown>;
	timeout?: number;
};

export function getScriptInjectionCode(
	requestId: string | null,
	{ getState, dispatch }: StateAccess,
	response?: EndpointResponse,
	auditLog?: AuditLog,
) {
	const modifyRequest = (
		requestId: string,
		modifications: { body?: Record<string, unknown>; queryParams?: KeyValuePair[]; headers?: KeyValuePair[] },
	) => {
		const state = getState();
		const request = state.requests[requestId];
		if (request == null) {
			return;
		}

		const update: Update<EndpointRequest> = { id: requestId };

		if (modifications.body != undefined) {
			update.bodyType = 'raw';
			update.rawType = 'JSON';
			update.body = JSON.stringify(modifications.body);
		}
		if (modifications.queryParams != undefined) {
			update.queryParams = new OrderedKeyValuePairs(update.queryParams, modifications.queryParams).toArray();
		}
		if (modifications.headers != undefined) {
			update.headers = new OrderedKeyValuePairs(update.headers, modifications.headers).toArray();
		}

		dispatch(updateRequest(update));
	};

	const fetch = <T = unknown>(url: string, request: HttpOptions) => {
		const modifiedRequest = {
			...request,
			body: request.body != undefined ? Body.json(request.body) : undefined,
		};
		return http.fetch<T>(url, modifiedRequest);
	};

	const getRequest = () => (requestId != null ? getState().requests[requestId] : null);

	const setEnvironmentVariable = (key: string, value: string, level: 'request' | 'service' | 'global' = 'request') => {
		const data = getState();
		const request = getRequest();
		const newPairs = new OrderedKeyValuePairs();
		switch (level) {
			case 'request':
				newPairs.apply(request?.environmentOverride?.pairs);
				newPairs.set(key, value);
				dispatch(
					updateRequest({
						id: request!.id,
						environmentOverride: { ...request!.environmentOverride, pairs: newPairs.toArray() },
					}),
				);
				break;
			case 'service':
				const endpoint = data.endpoints[request!.endpointId];
				if (!endpoint) {
					return;
				}
				const service = data.services[endpoint.serviceId];
				if (!service) {
					return;
				}
				if (service.selectedEnvironment) {
					const env = service.localEnvironments[service.selectedEnvironment];
					newPairs.apply(env.pairs);
					newPairs.set(key, value);
					dispatch(
						updateService({
							id: endpoint.serviceId,
							localEnvironments: {
								...service.localEnvironments,
								[service.selectedEnvironment]: { ...env, pairs: newPairs.toArray() },
							},
						}),
					);
				}
				break;
			default:
				const env = data.environments[data.selectedEnvironment ?? ''];
				if (env != null) {
					newPairs.apply(env.pairs);
					newPairs.set(key, value);
					dispatch(updateEnvironment({ ...env, pairs: newPairs.toArray() }));
				}
		}
	};

	const setQueryParam = (key: string, value: string) => {
		const request = getRequest();
		if (request == null) {
			return;
		}
		const newQueryParams = new OrderedKeyValuePairs(request.queryParams);
		newQueryParams.set(key, value);
		dispatch(updateRequest({ id: request.id, queryParams: newQueryParams.toArray() }));
	};

	const setHeader = (key: string, value: string) => {
		const request = getRequest();
		if (request == null) {
			return;
		}
		const newHeaders = new OrderedKeyValuePairs(request.headers);
		newHeaders.set(key, value);
		dispatch(updateRequest({ id: request.id, headers: newHeaders.toArray() }));
	};
	const deleteHeader = (key: string) => {
		const request = getRequest();
		if (request == null) {
			return;
		}
		const newHeaders = new OrderedKeyValuePairs(request.headers);
		newHeaders.delete(key);
		dispatch(updateRequest({ id: request.id, headers: newHeaders.toArray() }));
	};
	const getEnvironment = () => {
		const data = getState();
		const request = getRequest();
		if (request == null) {
			return EnvironmentContextResolver.buildEnvironmentVariables(getEnvValuesFromData(data)).toObject();
		}
		const endpoint = data.endpoints[request.endpointId];
		const serviceId = endpoint?.serviceId;
		return EnvironmentContextResolver.buildEnvironmentVariables(getEnvValuesFromData(data, request.id)).toObject();
	};

	const sendRequest = async (requestId: string) => {
		await dispatch(makeRequest({ requestId, auditLog }));
		const data = getState();
		return data.requests[requestId].history[data.requests[requestId].history.length - 1]?.response;
	};

	const getRunnableScripts = () => {
		const data = getState();
		return Object.values(data.scripts).reduce(
			(previousValue: Record<string, () => Promise<unknown>>, currentValue: Script) => {
				return {
					...previousValue,
					[currentValue.scriptCallableName]: async () => {
						if (auditLog) {
							auditLogManager.addToAuditLog(auditLog, 'before', 'standaloneScript', currentValue.id);
						}
						const result = await scriptRunnerManager.runTypescriptContextless(currentValue);
						if (auditLog) {
							auditLogManager.addToAuditLog(auditLog, 'after', 'standaloneScript', currentValue.id);
						}
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
		setHeader,
		deleteHeader,
		getEnvironment,
		sendRequest,
		fetch,
		modifyRequest,
		get data() {
			return structuredClone(getState());
		},
		get activeRequest() {
			return requestId != null ? structuredClone(getState().requests[requestId]) : null;
		},
		get response() {
			const request = getRequest();
			if (request == null) {
				return null;
			}
			const latestResponse =
				(response ?? (request.history && request.history.length > 0))
					? request.history[request.history.length - 1]
					: null;
			return latestResponse;
		},
	};
}
