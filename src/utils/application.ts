export function queryParamsToString(queryParams: Record<string, string[]>): string {
	const searchParams = new URLSearchParams();
	Object.keys(queryParams).forEach((queryParamKey) => {
		queryParams[queryParamKey].forEach((queryParamVal) => {
			searchParams.append(queryParamKey, queryParamVal);
		});
	});

	return decodeURIComponent(searchParams.toString());
}

export function queryParamsToStringReplaceVars(
	queryParams: Record<string, string[]>,
	replaceFunc: (text: string) => string,
): string {
	const searchParams = new URLSearchParams();
	Object.keys(queryParams).forEach((queryParamKey) => {
		queryParams[queryParamKey].forEach((queryParamVal) => {
			const newKey = replaceFunc(queryParamKey);
			const newVal = replaceFunc(queryParamVal);
			searchParams.append(newKey, newVal);
		});
	});
	return searchParams.toString();
}
