import { KeyValuePair, KeyValueValues, OrderedKeyValuePairs } from '@/classes/OrderedKeyValuePairs';
import { activeActions, Update } from '@/state/active/slice';
import { StateAccess } from '@/state/types';
import { AuditLog } from '@/types/data/audit';
import { EndpointRequest, EndpointResponse, Script } from '@/types/data/workspace';
import { http } from '@tauri-apps/api';
import { Body, HttpVerb } from '@tauri-apps/api/http';
import { EnvironmentContextResolver } from '../EnvironmentContextResolver';
import { getEnvValuesFromData } from '@/utils/application';
import { makeRequest } from '@/state/active/thunks/requests';
import { auditLogManager } from '../AuditLogManager';
import { scriptRunnerManager } from './ScriptRunnerManager';

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
		const state = getState().active;
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

		dispatch(activeActions.updateRequest(update));
	};

	const fetch = <T = unknown>(url: string, request: HttpOptions) => {
		const modifiedRequest = {
			...request,
			body: request.body != undefined ? Body.json(request.body) : undefined,
		};
		return http.fetch<T>(url, modifiedRequest);
	};

	const getRequest = () => (requestId != null ? getState().active.requests[requestId] : null);

	const getHistory = () => (requestId == null ? null : getState().active.history[requestId]);

	const setEnvironmentVariable = (key: string, value: string, level: 'request' | 'service' | 'global' = 'request') => {
		const data = getState().active;
		const request = getRequest();
		const newPairs = new OrderedKeyValuePairs();
		switch (level) {
			case 'request':
				newPairs.apply(request?.environmentOverride?.pairs);
				newPairs.set(key, value);
				dispatch(
					activeActions.updateRequest({
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
				const selectedEnvId = data.selectedServiceEnvironments[service.id];
				if (selectedEnvId) {
					const env = service.localEnvironments[selectedEnvId];
					newPairs.apply(env.pairs);
					newPairs.set(key, value);
					dispatch(
						activeActions.updateService({
							id: endpoint.serviceId,
							localEnvironments: {
								...service.localEnvironments,
								[selectedEnvId]: { ...env, pairs: newPairs.toArray() },
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
					dispatch(activeActions.updateEnvironment({ ...env, pairs: newPairs.toArray() }));
				}
		}
	};

	const setQueryParam = (key: string, value: KeyValueValues) => {
		const request = getRequest();
		if (request == null) {
			return;
		}
		const newQueryParams = new OrderedKeyValuePairs(request.queryParams);
		newQueryParams.set(key, value);
		dispatch(activeActions.updateRequest({ id: request.id, queryParams: newQueryParams.toArray() }));
	};

	const setHeader = (key: string, value: string) => {
		const request = getRequest();
		if (request == null) {
			return;
		}
		const newHeaders = new OrderedKeyValuePairs(request.headers);
		newHeaders.set(key, value);
		dispatch(activeActions.updateRequest({ id: request.id, headers: newHeaders.toArray() }));
	};
	const deleteHeader = (key: string) => {
		const request = getRequest();
		if (request == null) {
			return;
		}
		const newHeaders = new OrderedKeyValuePairs(request.headers);
		newHeaders.delete(key);
		dispatch(activeActions.updateRequest({ id: request.id, headers: newHeaders.toArray() }));
	};
	const getEnvironment = () => {
		const data = getState().active;
		const request = getRequest();
		if (request == null) {
			return EnvironmentContextResolver.buildEnvironmentVariables(getEnvValuesFromData(data)).toObject();
		}
		return EnvironmentContextResolver.buildEnvironmentVariables(getEnvValuesFromData(data, request.id)).toObject();
	};

	const sendRequest = async (requestId: string) => {
		await dispatch(makeRequest({ requestId, auditLog }));
		const data = getState().active;
		const history = data.history[requestId];
		return history[history.length - 1]?.response;
	};

	const getRunnableScripts = () => {
		const data = getState().active;
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
			return requestId != null ? structuredClone(getState().active.requests[requestId]) : null;
		},
		get response() {
			const history = getHistory();
			if (history == null) {
				return null;
			}
			const latestResponse = (response ?? (history && history.length > 0)) ? history[history.length - 1] : null;
			return latestResponse;
		},
	};
}
