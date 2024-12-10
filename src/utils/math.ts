/**
 * Clamps a function to a given range. If the max is lower than the min, returns the min as the only valid value.
 */
export function clamp(value: number, min: number, max: number) {
	if (max < min) return min;
	return Math.min(Math.max(value, min), max);
}

export function setsAreEqual<T>(setA: Set<T>, setB: Set<T>): boolean {
	if (setA === setB) {
		return true;
	}
	if (setA.size !== setB.size) {
		return false;
	}
	for (const value of setA) {
		if (!setB.has(value)) {
			return false;
		}
	}
	return true;
}

export function maxAmplitude(...nums: number[]) {
	return nums.sort((a, b) => Math.abs(b) - Math.abs(a))[0];
}
