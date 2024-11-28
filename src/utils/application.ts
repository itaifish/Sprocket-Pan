import { QueryParams } from '../types/application-data/application-data';

export function queryParamsToString(queryParams: QueryParams): string {
	const searchParams = new URLSearchParams();
	queryParams.toArray().forEach(({ key, value }) => searchParams.append(key, value ?? ''));
	return decodeURIComponent(searchParams.toString());
}

export function queryParamsToStringReplaceVars(
	queryParams: QueryParams,
	replaceFunc: (text: string) => string,
): string {
	const searchParams = new URLSearchParams();
	queryParams.toArray().forEach(({ key, value }) => searchParams.append(replaceFunc(key), replaceFunc(value ?? '')));
	return searchParams.toString();
}
