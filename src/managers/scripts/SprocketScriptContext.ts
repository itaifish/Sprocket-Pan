import { HttpOptions, OptionalScriptContext, SprocketInjectedScripts } from './types';
import { Token } from '@/types/shared/misc';
import { checkInterrupt } from '@/utils/functions';
import { EndpointRequest, HistoricalEndpointResponse } from '@/types/data/workspace';
import { OrderedKeyValuePairs } from '@/classes/OrderedKeyValuePairs';
import { activeActions, Update } from '@/state/active/slice';
import { KeyValuePair, KeyValueValues } from '@/types/shared/keyValues';
import { Body } from '@tauri-apps/api/http';
import { http } from '@tauri-apps/api';
import { getEnvValuesFromData, getSettingsFromState } from '@/utils/application';
import { EnvironmentContextResolver } from '../EnvironmentContextResolver';
import { sleep } from '@/utils/misc';
import { log } from '@/utils/logging';
import { StateAccessManager } from '../data/StateAccessManager';
import { networkRequestManager } from '../NetworkRequestManager';

export class SprocketScriptContext implements SprocketInjectedScripts {
	private token: Token<boolean> = { current: false };
	private dispatch;
	private getState;
	context;

	constructor(context: OptionalScriptContext = {}) {
		this.context = context;
		this.dispatch = checkInterrupt(StateAccessManager.dispatch, this.token);
		this.getState = checkInterrupt(StateAccessManager.getState, this.token);
	}

	interrupt = (comment: string = 'none') => {
		log.info(`Attempting to interrupt script ${this.context.name}. Reason given: ${comment}`);
		this.token.comment = comment;
		this.token.current = true;
	};

	sleep = sleep;

	getWorkspace = () => {
		return this.getState().active;
	};

	getRequestById = (requestId: string) => {
		const request = this.getWorkspace().requests[requestId];
		if (request == null) {
			throw new Error(`request [${requestId}] not found in state!`);
		}
		return request;
	};

	getRequest = () => {
		const requestId = this.context.requestId;
		if (requestId == null) {
			throw new Error(
				"Request id missing from context! You may have been trying to access request-scoped methods from a chain of scripts running in the global context. If not, this may be a bug in SprocketPan's context injection.",
			);
		}
		return this.getRequestById(requestId);
	};

	getRequestFamily = () => {
		const { endpoints, services } = this.getWorkspace();
		const request = this.getRequest();
		const endpoint = endpoints[request.endpointId];
		if (endpoint == null) {
			throw new Error(`endpoint [${request.endpointId}] parent of request [${request.id}] not found in state!`);
		}
		const service = services[endpoint.serviceId];
		if (service == null) {
			throw new Error(`service [${endpoint.serviceId}] grandparent of request [${request.id}] not found in state!`);
		}
		return { request, endpoint, service };
	};

	getHistoryById = (requestId?: string): HistoricalEndpointResponse[] => {
		return requestId == null ? [] : (this.getWorkspace().history[requestId] ?? []);
	};

	getHistory = () => {
		return this.getHistoryById(this.context.requestId);
	};

	setRequestEnvVariable = (key: string, value: string) => {
		const request = this.getRequest();
		const newPairs = new OrderedKeyValuePairs();
		newPairs.apply(request?.environmentOverride?.pairs);
		newPairs.set(key, value);
		this.dispatch(
			activeActions.updateRequest({
				id: request!.id,
				environmentOverride: { ...request!.environmentOverride, pairs: newPairs.toArray() },
			}),
		);
	};

	setServiceEnvVariable = (key: string, value: string) => {
		const newPairs = new OrderedKeyValuePairs();
		const { service } = this.getRequestFamily();
		const selectedEnvId = this.getWorkspace().selectedServiceEnvironments[service.id];
		if (selectedEnvId) {
			const env = service.localEnvironments[selectedEnvId];
			newPairs.apply(env.pairs);
			newPairs.set(key, value);
			this.dispatch(
				activeActions.updateService({
					id: service.id,
					localEnvironments: {
						...service.localEnvironments,
						[selectedEnvId]: { ...env, pairs: newPairs.toArray() },
					},
				}),
			);
		}
	};

	setGlobalEnvVariable = (key: string, value: string) => {
		const data = this.getWorkspace();
		const newPairs = new OrderedKeyValuePairs();
		const env = data.environments[data.selectedEnvironment ?? ''];
		if (env != null) {
			newPairs.apply(env.pairs);
			newPairs.set(key, value);
			this.dispatch(activeActions.updateEnvironment({ ...env, pairs: newPairs.toArray() }));
		}
	};

	setEnvironmentVariable = (key: string, value: string, level?: 'request' | 'service' | 'global') => {
		switch (level) {
			case 'global':
				return this.setGlobalEnvVariable(key, value);
			case 'service':
				return this.setServiceEnvVariable(key, value);
			default:
				return this.setRequestEnvVariable(key, value);
		}
	};

	modifyRequest = (
		requestId: string,
		modifications: { body?: Record<string, unknown>; queryParams?: KeyValuePair[]; headers?: KeyValuePair[] },
	) => {
		const request = this.getRequestById(requestId);
		const update: Update<EndpointRequest> = { id: request.id };
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
		this.dispatch(activeActions.updateRequest(update));
	};

	fetch = <T>(url: string, request: HttpOptions) => {
		const modifiedRequest = {
			...request,
			body: request.body != undefined ? Body.json(request.body) : undefined,
		};
		return http.fetch<T>(url, modifiedRequest);
	};

	sendRequest = async (requestId: string) => {
		const res = await networkRequestManager.makeRequestWithScripts(requestId);
		const settings = getSettingsFromState(this.getState());
		this.dispatch(
			activeActions.addResponseToHistory({
				requestId,
				...res,
				maxLength: settings.history.maxLength,
				discard: !settings.history.enabled,
			}),
		);
		const history = this.getHistoryById(requestId);
		return history[history.length - 1].response;
	};

	deleteHeader = (key: string) => {
		const request = this.getRequest();
		const newHeaders = new OrderedKeyValuePairs(request.headers);
		newHeaders.delete(key);
		this.dispatch(activeActions.updateRequest({ id: request.id, headers: newHeaders.toArray() }));
	};

	setHeader = (key: string, value: string) => {
		const request = this.getRequest();
		const newHeaders = new OrderedKeyValuePairs(request.headers);
		newHeaders.set(key, value);
		this.dispatch(activeActions.updateRequest({ id: request.id, headers: newHeaders.toArray() }));
	};

	setQueryParam = (key: string, value: KeyValueValues | undefined) => {
		const request = this.getRequest();
		const newQueryParams = new OrderedKeyValuePairs(request.queryParams);
		newQueryParams.set(key, value);
		this.dispatch(activeActions.updateRequest({ id: request.id, queryParams: newQueryParams.toArray() }));
	};

	get data() {
		return structuredClone(this.getWorkspace());
	}
	getEnvironment() {
		const data = this.data;
		return EnvironmentContextResolver.buildEnvironmentVariables(
			getEnvValuesFromData(data, this.context.requestId),
		).toObject();
	}
	get request() {
		return structuredClone(this.getRequest());
	}
	get history() {
		return structuredClone(this.getHistory());
	}
	get response() {
		const response = this.context.response;
		const history = this.history;
		return structuredClone((response ?? (history && history.length > 0)) ? history[history.length - 1] : null);
	}
}
