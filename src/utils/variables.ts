import { KeyValuePair } from '@/types/shared/keyValues';
import { RecursivePartial } from '@/types/utils/utils';

export function replaceValuesByKey(text: string, values: KeyValuePair<string>[] = []) {
	let newText = text;
	values.forEach(({ key, value }) => {
		newText = newText.replaceAll(`{${key}}`, value ?? '');
	});
	return newText;
}

/**
 * Determines if the arg is a Record<something, unknown>
 * Returns false for null and undefined, true for objects with default constructor
 */
export function isRecord(test: unknown) {
	return test?.constructor === Object;
}

// we don't need any of the fancy anti-looping, support for custom objects, or array merging of libraries atm
// typescript is hard though
export function mergeDeep<T, J extends RecursivePartial<T>>(obj1: T, obj2: J, iteration = 0): J & T {
	if (iteration > 50) throw new Error("mergeDeep is a-loopin' (probably)");
	if (obj1 == null) return obj2;
	const newObj = structuredClone(obj1);
	for (const key in obj2) {
		if (isRecord(obj2[key])) {
			newObj[key] = mergeDeep(obj1[key], obj2[key], iteration++);
		} else {
			newObj[key] = obj2[key];
		}
	}
	return newObj;
}

// Object.groupBy exists, but is not supported here yet (12/17/24)
export function groupBy<T>(items: T[], func: (item: T) => string) {
	const retObj: Record<string, T[]> = {};
	items.forEach((item) => {
		const key = func(item);
		if (retObj[key] == null) retObj[key] = [];
		retObj[key].push(item);
	});
	return retObj;
}
