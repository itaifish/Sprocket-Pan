import { QueryParams } from '../types/application-data/application-data';

export function queryParamsToString(queryParams: QueryParams): string {
	const searchParams = new URLSearchParams();
	Object.keys(queryParams).forEach((queryParamKey) => {
		if (!queryParamKey.startsWith('__')) {
			queryParams[queryParamKey].forEach((queryParamVal) => {
				searchParams.append(queryParamKey, queryParamVal);
			});
		}
	});

	return decodeURIComponent(searchParams.toString());
}

export function queryParamsToStringReplaceVars(
	queryParams: QueryParams,
	replaceFunc: (text: string) => string,
): string {
	const searchParams = new URLSearchParams();
	Object.keys(queryParams).forEach((queryParamKey) => {
		if (!queryParamKey.startsWith('__')) {
			queryParams[queryParamKey].forEach((queryParamVal) => {
				const newKey = replaceFunc(queryParamKey);
				const newVal = replaceFunc(queryParamVal);
				searchParams.append(newKey, newVal);
			});
		}
	});
	return searchParams.toString();
}
