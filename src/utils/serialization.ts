import { KeyValueValues, OrderedKeyValuePairs } from '../classes/OrderedKeyValuePairs';

export function parseOrderedKeyValuePairs<T extends KeyValueValues>(value: string) {
	return new OrderedKeyValuePairs<T>(JSON.parse(value));
}
