import { RawBodyType, RequestBodyType } from '@/types/data/shared';
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
