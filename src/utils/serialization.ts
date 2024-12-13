import { KeyValuePair, KeyValueValues, OrderedKeyValuePairs } from '@/classes/OrderedKeyValuePairs';
import { toKeyValuePairs } from './application';

export function parseOrderedKeyValuePairs<T extends KeyValueValues>(value: string) {
	return new OrderedKeyValuePairs<T>(JSON.parse(value));
}

export function headersToJson(headers: Record<string, string> | KeyValuePair[]): string {
	const convertedHeaders = Array.isArray(headers) ? headers.slice() : toKeyValuePairs(headers);
	return JSON.stringify(
		convertedHeaders
			.sort((e1, e2) => e1.key.localeCompare(e2.key))
			.reduce(
				(acc, curr) => {
					acc[curr.key] = curr.value ?? '';
					return acc;
				},
				{} as Record<string, string>,
			),
	);
}

export function multilineUrl(url: string): string {
	const { protocol, username, password, host, pathname, searchParams: rawParams, hash } = new URL(url);
	const searchParams = [...rawParams.entries()].map((entry) => entry.join('=')).sort();
	return JSON.stringify({ protocol, username, password, host, pathname, searchParams, hash });
}
