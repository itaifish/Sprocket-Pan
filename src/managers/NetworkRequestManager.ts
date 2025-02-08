import { Body, ResponseType, fetch } from '@tauri-apps/api/http';
import * as xmlParse from 'xml2js';
import yaml from 'js-yaml';
import { OrderedKeyValuePairs } from '@/classes/OrderedKeyValuePairs';
import { CONTENT_TYPE } from '@/constants/request';
import { AuditLog } from '@/types/data/audit';
import { RawBodyType, RawBodyTypes } from '@/types/data/shared';
import { EndpointResponse, EndpointRequest, NetworkFetchRequest, Endpoint, Service } from '@/types/data/workspace';
import { getEnvValuesFromData, getSettingsFromState, queryParamsToString, toKeyValuePairs } from '@/utils/application';
import { errorToSprocketError, getRequestBodyCategory, rawBodyTypeToMime } from '@/utils/conversion';
import { asyncCallWithTimeout } from '@/utils/functions';
import { log } from '@/utils/logging';
import { capitalizeWord } from '@/utils/string';
import { AuditLogManager } from './AuditLogManager';
import { EnvironmentContextResolver } from './EnvironmentContextResolver';
import { RunTypescriptWithFullContextArgs, ScriptRunnerManager } from './scripts/ScriptRunnerManager';
import { RootState } from '@/state/store';
import { StateAccessManager } from './data/StateAccessManager';

type ScriptObjs = { service: Service; endpoint: Endpoint; request: EndpointRequest };

class NetworkRequestManager {
	public static readonly INSTANCE = new NetworkRequestManager();

	private xmlBuilder: xmlParse.Builder;

	private constructor() {
		this.xmlBuilder = new xmlParse.Builder();
	}

	private buildScripts(state: RootState, scriptObjs: ScriptObjs, type: 'pre' | 'post') {
		return getSettingsFromState(state).script.strategy[type].map((strat) => ({
			script: scriptObjs[strat] ? scriptObjs[strat][`${type}RequestScript`]?.trim() || undefined : undefined,
			name: `${type}${capitalizeWord(strat)}Script` as const,
			id: scriptObjs[strat]?.id,
		}));
	}

	public async makeRequestWithScripts(requestId: string, auditLog: AuditLog = []) {
		let ret;
		const timestamp = new Date().getTime();
		try {
			await this.runScripts(requestId, auditLog);
			const state = StateAccessManager.getState();
			ret = await this.sendRequest(requestId, state, auditLog);
			await this.runScripts(requestId, auditLog, ret.response);
			return { ...ret, timestamp, auditLog };
		} catch (err) {
			return { ...ret, timestamp, auditLog, error: errorToSprocketError(err) };
		}
	}

	public async runScripts(requestId: string, auditLog: AuditLog = [], response?: EndpointResponse) {
		const state = StateAccessManager.getState();
		const data = state.active;
		const request = data.requests[requestId];
		const endpointId = request.endpointId;
		const endpoint = data.endpoints[endpointId];
		const service = data.services[endpoint.serviceId];
		const scriptObjs = { service, endpoint, request };
		const scripts = this.buildScripts(state, scriptObjs, response == null ? 'pre' : 'post');
		for (const script of scripts) {
			if (script.script != undefined) {
				const interruptible = this.runScript({
					script: script.script,
					requestId,
					response,
					auditLog,
					type: script.name,
					associatedId: script.id,
				});
				await interruptible.result;
			}
		}
	}

	private async parseRequestForEnvironmentOverrides(request: EndpointRequest) {
		if (request.bodyType === 'none' || request.body == undefined) {
			return undefined;
		}
		if (request.rawType === 'JSON' || request.rawType === 'Yaml') {
			return yaml.load(request.body as string) as Record<string, unknown>;
		}
		if (request.rawType === 'XML') {
			return (await xmlParse.parseStringPromise(request.body)) as Record<string, unknown>;
		}
		return request.body as Record<string, unknown> | undefined;
	}

	private parseRequestForNetworkCall(
		request: EndpointRequest,
		parsedBody: Record<string, unknown> | unknown[] | string | undefined,
	) {
		if (parsedBody == undefined) {
			return undefined;
		}
		const category = getRequestBodyCategory(request.bodyType);
		if (request.rawType === 'JSON' || category === 'table') {
			return JSON.stringify(parsedBody as Record<string, unknown>);
		}
		if (request.rawType === 'Yaml') {
			return yaml.dump(parsedBody, { skipInvalid: true });
		}
		if (request.rawType === 'XML') {
			// convert to xml
			return this.xmlBuilder.buildObject(parsedBody);
		}
		return parsedBody as string;
	}

	public async sendRequest(requestId: string, state: RootState, auditLog: AuditLog = []) {
		const data = state.active;
		const envValues = getEnvValuesFromData(data, requestId);
		const request = data.requests[requestId];
		const endpoint = data.endpoints[request.endpointId];
		const service = data.services[endpoint.serviceId];
		const unparsedUrl = `${service.baseUrl}${endpoint.url}`;
		const url = EnvironmentContextResolver.resolveVariablesForString(unparsedUrl, envValues);
		let body: Record<string, unknown> | unknown[] | undefined = await this.parseRequestForEnvironmentOverrides(request);
		if (body != undefined && typeof body != 'string') {
			body = EnvironmentContextResolver.resolveVariablesForMappedObject(body, envValues);
		}
		const headers = new OrderedKeyValuePairs();
		log.info(`Resolving endpoint headers ${JSON.stringify(endpoint.baseHeaders)}`);
		// endpoint headers and then request headers
		endpoint.baseHeaders.forEach((header) => {
			if (header.value == null) {
				return;
			}
			const parsedKey = EnvironmentContextResolver.resolveVariablesForString(header.key, envValues);
			headers.set(parsedKey, EnvironmentContextResolver.resolveVariablesForString(header.value, envValues));
		});
		request.headers.forEach((header) => {
			if (header.value == null) {
				return;
			}
			const parsedKey = EnvironmentContextResolver.resolveVariablesForString(header.key, envValues);
			headers.set(parsedKey, EnvironmentContextResolver.resolveVariablesForString(header.value, envValues));
		});

		const fullQueryParams = new OrderedKeyValuePairs(endpoint.baseQueryParams, request.queryParams);
		let queryParamStr = queryParamsToString(fullQueryParams.toArray(), true, (text) =>
			EnvironmentContextResolver.resolveVariablesForString(text, envValues),
		);
		if (queryParamStr) {
			queryParamStr = `?${queryParamStr}`;
		}

		const networkRequestBodyText = this.parseRequestForNetworkCall(request, body) ?? '';
		let networkBody: Body | undefined;
		const category = getRequestBodyCategory(request.bodyType);
		if (category === 'table') {
			if (request.bodyType === 'x-www-form-urlencoded') {
				networkBody = Body.form(body as Record<string, string>);
			} else {
				networkBody = Body.json(body as Record<string, string>);
			}
		} else if (category !== 'none') {
			networkBody = Body.text(networkRequestBodyText);
			// auto-set content type if not already set
			if (headers.get(CONTENT_TYPE) == undefined) {
				headers.set(CONTENT_TYPE, rawBodyTypeToMime(request.rawType));
			}
		} else {
			networkBody = undefined;
		}

		AuditLogManager.addToAuditLog(auditLog, 'before', 'request', request?.id);

		const networkRequest: NetworkFetchRequest = {
			url: `${url}${queryParamStr}`,
			method: endpoint.verb,
			body: networkRequestBodyText,
			headers: headers.toObject(),
			dateTime: new Date().getTime(),
			bodyType: request.rawType,
		};

		const networkCall = fetch(networkRequest.url, {
			method: networkRequest.method,
			body: networkBody,
			headers: networkRequest.headers,
			responseType: ResponseType.Text,
		});

		const res: Awaited<ReturnType<typeof fetch>> = await asyncCallWithTimeout(
			networkCall,
			getSettingsFromState(state).request.timeoutMS,
		);
		AuditLogManager.addToAuditLog(auditLog, 'after', 'request', request?.id);
		const responseText = res.data as string;
		const response = {
			statusCode: res.status,
			headers: toKeyValuePairs(res.headers),
			bodyType: this.headersContentTypeToBodyType(res.headers['content-type']),
			body: responseText,
			dateTime: new Date().getTime(),
		};
		return { response, request: networkRequest };
	}

	public runScript(args: Partial<RunTypescriptWithFullContextArgs>) {
		if (args.script == null) {
			throw new Error("cannot run script that doesn't exist");
		}
		if (args.auditLog != undefined) {
			AuditLogManager.addToAuditLog(args.auditLog, 'before', 'standaloneScript', args.associatedId);
		}
		const result = ScriptRunnerManager.runTypescriptWithFullContext(args as RunTypescriptWithFullContextArgs);
		if (args.auditLog != undefined) {
			AuditLogManager.addToAuditLog(args.auditLog, 'after', 'standaloneScript', args.associatedId);
		}
		return result;
	}

	private headersContentTypeToBodyType(contentType: string | null): RawBodyType {
		let bodyType: RawBodyType = 'Text';
		if (contentType == null) {
			return bodyType;
		}
		RawBodyTypes.forEach((rawBodyType) => {
			if (contentType.toLowerCase().includes(rawBodyType.toLowerCase())) {
				bodyType = rawBodyType;
			}
		});
		return bodyType;
	}
}

export const networkRequestManager = NetworkRequestManager.INSTANCE;
