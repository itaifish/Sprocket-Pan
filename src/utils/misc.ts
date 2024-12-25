import { Token } from '@/types/shared/misc';
import { Interrupt } from './types';

export function sleep(ms = 0): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getClearableTimeout(ms = 0) {
	const token: Token<ReturnType<typeof setTimeout>> = { current: null };
	const promise = new Promise((_, reject) => {
		token.current = setTimeout(() => reject(new Error(`Timeout of ${ms / 1000}s Reached!`)), ms);
	});
	return { promise, clear: () => clearTimeout(token.current ?? undefined) };
}

export function interruptingTimeout<T>(promise: Promise<T>, interrupt: Interrupt, timeout?: number): Promise<T> {
	if (timeout == null) return promise;
	const timeoutPromise = getClearableTimeout(timeout);
	timeoutPromise.promise.catch((err) => interrupt(err.message));
	return promise.finally(timeoutPromise.clear);
}
