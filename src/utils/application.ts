import { KeyValueValues, OrderedKeyValuePairs } from '../classes/OrderedKeyValuePairs';
import { EnvironmentContextResolver } from '../managers/EnvironmentContextResolver';
import { Environment, QueryParams } from '../types/application-data/application-data';

export function queryParamsToString(
	queryParams: QueryParams,
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
	return searchParams.toString();
}

export function cloneEnv(env?: Partial<Environment>): Environment {
	return {
		name: '',
		id: '',
		...env,
		pairs: env?.pairs ?? [],
	};
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
