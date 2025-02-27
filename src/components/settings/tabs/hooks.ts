import { useMemo } from 'react';

export function useShouldDisplayFromSearch<T>(value: T, searchText: string | undefined) {
	const shouldDisplay = useMemo(
		() =>
			searchText == null ||
			searchText === '' ||
			JSON.stringify(value).toLocaleLowerCase().includes(searchText.toLocaleLowerCase()),
		[value, searchText],
	);
	return shouldDisplay;
}
