import { PayloadAction } from '@reduxjs/toolkit';
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
import { cloneEnv } from '../../utils/application';

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

		const update: PayloadAction<Update<EndpointRequest>>['payload'] = { id: requestId };

		if (modifications.body != undefined) {
			update.bodyType = 'raw';
			update.rawType = 'JSON';
			update.body = JSON.stringify(modifications.body);
		}
		if (modifications.queryParams != undefined) {
			update.queryParams?.apply(modifications.queryParams);
		}
		if (modifications.headers != undefined) {
			update.headers?.apply(modifications.headers);
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
		switch (level) {
			case 'request':
				const environmentOverride = cloneEnv(request!.environmentOverride);
				environmentOverride.pairs.set(key, value);
				dispatch(updateRequest({ id: request!.id, environmentOverride }));
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
					const newEnv = cloneEnv(service.localEnvironments[service.selectedEnvironment]);
					newEnv.pairs.set(key, value);
					dispatch(
						updateService({
							id: endpoint.serviceId,
							localEnvironments: {
								...service.localEnvironments,
								[service.selectedEnvironment]: newEnv,
							},
						}),
					);
				}
				break;
			default:
				const newEnv = cloneEnv(data.environments[data.selectedEnvironment ?? '']);
				if (newEnv) {
					newEnv.pairs.set(key, value);
					dispatch(updateEnvironment(newEnv));
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
		dispatch(updateRequest({ id: request.id, queryParams: newQueryParams }));
	};

	const setHeader = (key: string, value: string) => {
		const request = getRequest();
		if (request == null) {
			return;
		}
		const newHeaders = new OrderedKeyValuePairs(request.headers);
		newHeaders.set(key, value);
		dispatch(updateRequest({ id: request.id, headers: newHeaders }));
	};
	const deleteHeader = (key: string) => {
		const request = getRequest();
		if (request == null) {
			return;
		}
		const newHeaders = new OrderedKeyValuePairs(request.headers);
		newHeaders.delete(key);
		dispatch(updateRequest({ id: request.id, headers: newHeaders }));
	};
	const getEnvironment = () => {
		const data = getState();
		const request = getRequest();
		if (request == null) {
			return EnvironmentContextResolver.buildEnvironmentVariables(data).toObject();
		}
		const endpoint = data.endpoints[request.endpointId];
		const serviceId = endpoint?.serviceId;
		return EnvironmentContextResolver.buildEnvironmentVariables(data, serviceId, request.id).toObject();
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
