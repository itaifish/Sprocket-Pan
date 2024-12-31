import { getClearableTimeout, interruptingTimeout } from './misc';
import { InterruptibleScriptReturn } from './types';
import { Token } from '@/types/shared/misc';
import { SprocketScriptContext } from '@/managers/scripts/SprocketScriptContext';

/**
 * Call an async function with a maximum time limit (in milliseconds) for the timeout
 * @param asyncPromise An asynchronous promise to resolve
 * @param timeLimit Time limit to attempt function in milliseconds
 * @returns Resolved promise for async function call, or rejected if time limit reached
 */
export function asyncCallWithTimeout<T>(asyncPromise: Promise<T>, timeLimit: number) {
	return Promise.race([getClearableTimeout(timeLimit).promise, asyncPromise]) as Promise<T>;
}

export function runContextfulInterruptibleScript<T>(
	script: string,
	sp: SprocketScriptContext,
	timeout?: number,
): InterruptibleScriptReturn<T> {
	const result = Object.getPrototypeOf(async () => {}).constructor('sp', script)(sp);
	return { result: interruptingTimeout(result, sp.interrupt, timeout), interrupt: sp.interrupt };
}

type Replacer = (key: string, value: unknown) => unknown;

export function combineReplacers(replacers: Replacer[]): Replacer {
	return (key: string, value: unknown) => {
		replacers.forEach((replacer) => {
			value = replacer(key, value);
		});
		return value;
	};
}

export function nullifyProperties<T extends Record<string, any>>(...keys: (keyof T)[]): Replacer {
	return (key, value) => {
		if (keys.includes(key)) {
			return undefined;
		}
		return value;
	};
}

export function safeJsonParse<T>(str: string) {
	try {
		return [null, JSON.parse(str) as T] as const;
	} catch (err) {
		return [err, null] as const;
	}
}

export function checkInterrupt<T, A extends any[]>(func: (...args: A) => T, token: Token<boolean>) {
	return (...args: A) => {
		if (token.current) {
			throw new Error(`operation interrupted, reason: ${token.comment}`);
		}
		return func(...args);
	};
}
