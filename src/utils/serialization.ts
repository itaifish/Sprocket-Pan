import { KeyValueValues, OrderedKeyValuePairs } from '../classes/OrderedKeyValuePairs';

const dateKeys = ['dateTime', 'timestamp', 'lastModified'];

export function dateTimeReviver(key: string, value: string) {
	if (dateKeys.includes(key)) {
		return new Date(value).getTime();
	}
	return value;
}

export function parseOrderedKeyValuePairs<T extends KeyValueValues>(value: string) {
	return new OrderedKeyValuePairs<T>(JSON.parse(value));
}

export function orderedKeyValuePairsReviver(key: string, value: string) {
	return '';
}
