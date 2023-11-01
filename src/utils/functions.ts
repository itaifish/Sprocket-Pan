/**
 * Call an async function with a maximum time limit (in milliseconds) for the timeout
 * @param asyncPromise An asynchronous promise to resolve
 * @param timeLimit Time limit to attempt function in milliseconds
 * @returns Resolved promise for async function call, or an error if time limit reached
 */
export const asyncCallWithTimeout = async <T>(asyncPromise: Promise<T>, timeLimit: number) => {
	let timeoutHandle: NodeJS.Timeout;

	const timeoutPromise = new Promise((_resolve, reject) => {
		timeoutHandle = setTimeout(
			() => reject(new Error(`Call Timeout Limit (${timeLimit / 1_000}s) Reached`)),
			timeLimit,
		);
	});

	return Promise.race([asyncPromise, timeoutPromise]).then((result) => {
		clearTimeout(timeoutHandle);
		return result as T;
	});
};

export const evalAsync = async (codeToEval: string) => {
	return Object.getPrototypeOf(async function () {}).constructor(codeToEval)();
};
