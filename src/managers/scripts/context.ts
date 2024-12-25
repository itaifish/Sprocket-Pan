import { EnvironmentContextResolver } from '../EnvironmentContextResolver';
import { getEnvValuesFromData } from '@/utils/application';
import { OptionalScriptContext, SprocketInjectedScripts } from './types';
import { KeyValueValues } from '@/types/shared/keyValues';
import { getSprocketScripts, getUserScripts } from './scripts';

export interface GetScriptInjectionCodeArgs {
	context: OptionalScriptContext;
}

type InterruptToken = { value: boolean };

function checkInterrupt<T, A extends any[]>(func: (...args: A) => T, token: InterruptToken) {
	return (...args: A) => {
		if (token.value) {
			throw new Error('operation manually interrupted');
		}
		return func(...args);
	};
}

export function getContextfulInterruptableScripts(context: OptionalScriptContext): SprocketInjectedScripts {
	const token = { value: false };
	const { sprocketScripts, userScripts } = globalThis as {
		sprocketScripts?: ReturnType<typeof getSprocketScripts>;
		userScripts?: ReturnType<typeof getUserScripts>;
	};

	if (sprocketScripts == null || userScripts == null) {
		throw new Error('SprocketPan scripts inaccessible.');
	}

	const usr: SprocketInjectedScripts['usr'] = {};
	for (const key in userScripts) {
		usr[key] = checkInterrupt(() => userScripts[key](context), token);
	}

	return {
		usr,
		sp: {
			fetch: checkInterrupt(sprocketScripts.fetch, token),
			modifyRequest: checkInterrupt(sprocketScripts.modifyRequest, token),
			setEnvironmentVariable: checkInterrupt(
				(key: string, value: string, level?: 'request' | 'service' | 'global') =>
					sprocketScripts.setEnvironmentVariable(context, key, value, level),
				token,
			),
			setQueryParam: checkInterrupt(
				(key: string, value: KeyValueValues | undefined) => sprocketScripts.setQueryParam(context, key, value),
				token,
			),
			setHeader: checkInterrupt((key: string, value: string) => sprocketScripts.setHeader(context, key, value), token),
			deleteHeader: checkInterrupt((key: string) => sprocketScripts.deleteHeader(context, key), token),
			sendRequest: checkInterrupt((requestId: string) => sprocketScripts.sendRequest(context, requestId), token),
			get data() {
				return sprocketScripts.data;
			},
			get environment() {
				const data = sprocketScripts.data;
				const request = sprocketScripts.getRequest(context);
				return EnvironmentContextResolver.buildEnvironmentVariables(getEnvValuesFromData(data, request?.id)).toObject();
			},
			get request() {
				return structuredClone(sprocketScripts.getRequest(context));
			},
			get history() {
				return structuredClone(sprocketScripts.getHistory(context));
			},
			get response() {
				const history = sprocketScripts.getHistory(context);
				if (history == null) {
					return null;
				}
				const latestResponse =
					(context.response ?? (history && history.length > 0)) ? history[history.length - 1] : null;
				return structuredClone(latestResponse);
			},
		},
	};
}
