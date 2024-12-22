export function sleep(ms = 0): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export function timeout(ms = 0): Promise<void> {
	return new Promise((_, reject) => setTimeout(() => reject(new Error(`Timeout of ${ms / 1000}s Reached!`)), ms));
}
