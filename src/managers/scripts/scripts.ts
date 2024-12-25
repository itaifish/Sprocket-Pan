import { OrderedKeyValuePairs } from '@/classes/OrderedKeyValuePairs';
import { activeActions, Update } from '@/state/active/slice';
import { makeRequest } from '@/state/active/thunks/requests';
import { StateAccess } from '@/state/types';
import { EndpointRequest, WorkspaceData } from '@/types/data/workspace';
import { KeyValuePair, KeyValueValues } from '@/types/shared/keyValues';
import { http } from '@tauri-apps/api';
import { Body, HttpVerb } from '@tauri-apps/api/http';
import { OptionalScriptContext } from './types';
import { ScriptRunnerManager } from './ScriptRunnerManager';

type HttpOptions = {
	method: HttpVerb;
	headers?: Record<string, unknown>;
	query?: Record<string, unknown>;
	body?: Record<string, unknown>;
	timeout?: number;
};

type RunnableScript = (
	context: Omit<OptionalScriptContext, 'type'>,
) => ReturnType<typeof ScriptRunnerManager.runTypescript<unknown>>;

function getRunnableScripts(data: WorkspaceData) {
	const scripts: Record<string, RunnableScript> = {};
	for (const key in data.scripts) {
		const script = data.scripts[key];
		scripts[script.scriptCallableName] = (context) =>
			ScriptRunnerManager.runTypescript({ ...context, type: 'standaloneScript' }, script);
	}
	return scripts;
}

export function getUserScripts({ getState }: StateAccess) {
	return getRunnableScripts(getState().active);
}

export function getSprocketScripts({ getState, dispatch }: StateAccess) {
	function getRequest({ requestId }: OptionalScriptContext) {
		return requestId != null ? getState().active.requests[requestId] : null;
	}

	function getHistory({ requestId }: OptionalScriptContext) {
		return requestId == null ? null : getState().active.history[requestId];
	}

	function setEnvironmentVariable(
		context: OptionalScriptContext,
		key: string,
		value: string,
		level: 'request' | 'service' | 'global' = 'request',
	) {
		const data = getState().active;
		const request = getRequest(context);
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
	}

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

	const fetch = <T>(url: string, request: HttpOptions) => {
		const modifiedRequest = {
			...request,
			body: request.body != undefined ? Body.json(request.body) : undefined,
		};
		return http.fetch<T>(url, modifiedRequest);
	};

	async function sendRequest({ auditLog }: OptionalScriptContext, requestId: string) {
		await dispatch(makeRequest({ requestId, auditLog }));
		const data = getState().active;
		const history = data.history[requestId];
		return history[history.length - 1]?.response;
	}

	async function deleteHeader(context: OptionalScriptContext, key: string) {
		const request = getRequest(context);
		if (request == null) {
			return;
		}
		const newHeaders = new OrderedKeyValuePairs(request.headers);
		newHeaders.delete(key);
		dispatch(activeActions.updateRequest({ id: request.id, headers: newHeaders.toArray() }));
	}

	async function setHeader(context: OptionalScriptContext, key: string, value: string) {
		const request = getRequest(context);
		if (request == null) {
			return;
		}
		const newHeaders = new OrderedKeyValuePairs(request.headers);
		newHeaders.set(key, value);
		dispatch(activeActions.updateRequest({ id: request.id, headers: newHeaders.toArray() }));
	}

	function setQueryParam(context: OptionalScriptContext, key: string, value: KeyValueValues | undefined) {
		const request = getRequest(context);
		if (request == null) {
			return;
		}
		const newQueryParams = new OrderedKeyValuePairs(request.queryParams);
		newQueryParams.set(key, value);
		dispatch(activeActions.updateRequest({ id: request.id, queryParams: newQueryParams.toArray() }));
	}

	return {
		setEnvironmentVariable,
		getRequest,
		getHistory,
		modifyRequest,
		sendRequest,
		deleteHeader,
		setHeader,
		setQueryParam,
		fetch,
		get data() {
			return structuredClone(getState().active);
		},
	};
}
