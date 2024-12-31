import { OptionalScriptContext } from '@/managers/scripts/types';
import { RawBodyType, RequestBodyType } from '@/types/data/shared';
import { SprocketError } from '@/types/state/state';
import mime from 'mime';

export function getRequestBodyCategory(requestBodyType: RequestBodyType) {
	let _exhaustive: never;
	switch (requestBodyType) {
		case 'none':
			return 'none';
		case 'raw':
			return 'raw';
		case 'form-data':
		case 'x-www-form-urlencoded':
			return 'table';
		default:
			_exhaustive = requestBodyType;
			return 'none';
	}
}

export function rawBodyTypeToMime(rawType: RawBodyType | undefined) {
	if (rawType === 'JavaScript') {
		return mime.getType('js') as string;
	}
	return mime.getType(rawType?.toLocaleLowerCase() ?? 'txt') ?? 'text/plain';
}

export function errorToSprocketError(err: unknown, context?: OptionalScriptContext) {
	const sprocketErr: SprocketError = { context: [] };
	const castErr = err as SprocketError;
	if (context != null) {
		sprocketErr.context!.push({ requestId: context.requestId, type: context.type, name: context.name });
	}
	if (err instanceof Error) {
		sprocketErr.message = err.message;
		sprocketErr.stack = err.stack;
	} else if (castErr.context != null) {
		sprocketErr.message = castErr.message;
		sprocketErr.stack = castErr.stack;
		sprocketErr.context = [...sprocketErr.context!, ...castErr.context];
	} else {
		sprocketErr.err = err;
	}
	return sprocketErr;
}
