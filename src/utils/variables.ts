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

interface MergeSettings {
	allowUndefined?: boolean;
}

/**
 * Merges to the specified depth, overwrites non-object properties, returns a new object. Utilizes structuredClone at the terminal depth.
 *
 * Depth 0 is the classic {...spread, ...merge}. Depth 1 performs spread merges on any direct properties that have the same name and are both objects. Depth 1 does that to the descendents of descendents, etc. Default depth is 10.
 *
 * !! Warning: high depths and large objects may cause silent failures.
 */
export function mergeDeep<T, J extends RecursivePartial<T>>(
	obj1: T,
	obj2: J,
	settings: MergeSettings = {},
	depth = 10,
): T & J {
	if (!isRecord(obj1) || !isRecord(obj2)) {
		return (obj2 !== undefined || settings.allowUndefined ? structuredClone(obj2) : structuredClone(obj1)) as T & J;
	}

	if (depth <= 0) {
		return { ...structuredClone(obj1), ...structuredClone(obj2) };
	}

	const obj1Copy = { ...obj1 };
	const obj2Copy = { ...obj2 };

	for (const key in obj2Copy) {
		if (key === '__proto__') {
			throw new Error('aaaaaAAAAAAA‽‽‽‽‽');
		}
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		obj1Copy[key] = mergeDeep(obj1Copy[key], obj2Copy[key], settings, depth--);
	}

	return obj1Copy as T & J;
}

export function assignDeep<T extends object, J>(obj1: T, obj2: J, depth = 5) {
	if (!isRecord(obj1) || !isRecord(obj2)) {
		return;
	}
	if (depth <= 0) {
		Object.assign(obj1, obj2);
	}
	const assignObj = {} as J;
	for (const key in obj2) {
		const tskey = key as unknown as keyof T;
		if (key === '__proto__') {
			throw new Error('‽‽‽‽‽∀∀∀∀∀∀∀ɐɐɐɐɐ');
		}
		if (obj1[tskey] === undefined) {
			assignObj[key] = obj2[key];
		} else {
			assignDeep(obj1[tskey] as object, obj2[key], depth--);
		}
	}
	assignDeep(obj1, assignObj);
}

// Object.groupBy exists, but is not supported here yet (12/17/24)
export function groupBy<T>(items: T[], func: (item: T) => string) {
	const retObj: Record<string, T[]> = {};
	items.forEach((item) => {
		const key = func(item);
		if (retObj[key] == null) {
			retObj[key] = [];
		}
		retObj[key].push(item);
	});
	return retObj;
}
