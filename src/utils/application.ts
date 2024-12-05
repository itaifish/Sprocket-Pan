import { v4 } from 'uuid';
import { KeyValueValues, OrderedKeyValuePairs } from '../classes/OrderedKeyValuePairs';
import { BuildEnvironmentVariablesArgs, EnvironmentContextResolver } from '../managers/EnvironmentContextResolver';
import { Environment, QueryParams, WorkspaceData } from '../types/application-data/application-data';

export function queryParamsToString(
	queryParams: QueryParams,
	encoded = false,
	replaceFunc: (text: string) => string = (element) => element,
): string {
	const searchParams = new URLSearchParams();
	queryParams.forEach(({ key, value }) => {
		if (Array.isArray(value)) {
			value.forEach((element) => searchParams.append(replaceFunc(key), replaceFunc(element)));
		} else {
			searchParams.append(replaceFunc(key), replaceFunc(value ?? ''));
		}
	});
	return encoded ? searchParams.toString() : decodeURIComponent(searchParams.toString());
}

export function cloneEnv(env?: Partial<Environment>, nameMod?: string): Environment {
	const newEnv = {
		name: env?.name ?? '',
		id: v4(),
		pairs: env?.pairs ?? [],
	};
	if (nameMod != null) {
		newEnv.name = newEnv.name + nameMod;
	}
	return newEnv;
}

export function toKeyValuePairs<T>(object: Record<string, T>) {
	return Object.entries(object).map(([key, value]) => ({ key, value }));
}

export function envParse(value: KeyValueValues | undefined, envValues: OrderedKeyValuePairs<string>) {
	if (value == null) {
		return '';
	}
	if (Array.isArray(value)) {
		value = value.join(', ');
	}
	return EnvironmentContextResolver.parseStringWithEnvironment(value, envValues)
		.map((x) => x.value)
		.join('');
}

export function getEnvValuesFromData(data: WorkspaceData, requestId?: string): BuildEnvironmentVariablesArgs {
	const values: BuildEnvironmentVariablesArgs = {
		secrets: data.secrets,
		rootEnv: data.selectedEnvironment == null ? null : data.environments[data.selectedEnvironment],
		rootAncestors: Object.values(data.environments),
	};
	if (requestId != null) {
		const request = data.requests[requestId];
		const endpoint = data.endpoints[request.endpointId];
		const service = data.services[endpoint.serviceId];
		values.servEnv =
			service.selectedEnvironment == null ? null : service.localEnvironments[service.selectedEnvironment];
		values.reqEnv = request.environmentOverride;
	}
	return values;
}
