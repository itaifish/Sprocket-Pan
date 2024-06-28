export function clamp(value: number, min: number, max: number) {
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
