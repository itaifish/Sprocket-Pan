import { KeyValuePair } from '@/classes/OrderedKeyValuePairs';
import { RecursivePartial } from '@/types/utils/utils';

export function replaceValuesByKey(text: string, values: KeyValuePair<string>[] = []) {
	let newText = text;
	values.forEach(({ key, value }) => {
		newText = newText.replaceAll(`{${key}}`, value ?? '');
	});
	return newText;
}

/**
 * Determines if the arg is a Record<string, unkonwn>
 * Returns false for normalized arrays (ones that start at 0)
 * Returns false for null and undefined
 * Returns false for strings (since their arrays start at 0)
 * Returns true for weird arrays that don't start at 0
 */
export function isStringRecord(test: unknown) {
	if (test == null) return false;
	const keys = Object.keys(test);
	return keys.length > 0 && keys[0] !== '0';
}

// we don't need any of the fancy anti-looping, support for custom objects, or array merging of libraries atm
export function mergeDeep<T>(obj1: T, obj2: RecursivePartial<T>, iteration = 0): T {
	if (iteration > 50) throw new Error("mergeDeep is a-loopin'");
	if (obj1 == null) return obj2 as T;
	const newObj = structuredClone(obj1);
	for (const key in obj2) {
		if (isStringRecord(obj2[key])) {
			newObj[key] = mergeDeep(obj1[key], obj2[key] as any, iteration++);
		} else {
			newObj[key] = obj2[key] as any;
		}
	}
	return newObj;
}
