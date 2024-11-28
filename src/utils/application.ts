import { QueryParams } from '../types/application-data/application-data';

export function queryParamsToString(
	queryParams: QueryParams,
	replaceFunc: (text: string) => string = (element) => element,
): string {
	const searchParams = new URLSearchParams();
	queryParams.toArray().forEach(({ key, value }) => {
		if (Array.isArray(value)) {
			value.forEach((element) => searchParams.append(replaceFunc(key), replaceFunc(element)));
		} else {
			searchParams.append(replaceFunc(key), replaceFunc(value ?? ''));
		}
	});
	return searchParams.toString();
}
