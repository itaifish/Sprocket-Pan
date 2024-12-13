import { KeyValuePair, KeyValueValues } from '@/classes/OrderedKeyValuePairs';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type Reference<TVariable extends string> = `{{${TVariable}}}`;
export const RESTfulRequestVerbs = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'] as const;
export type RESTfulRequestVerb = (typeof RESTfulRequestVerbs)[number];
export const RequestBodyTypes = ['none', 'form-data', 'x-www-form-urlencoded', 'raw'] as const;
export type RequestBodyType = (typeof RequestBodyTypes)[number];

export const RawBodyTypes = ['Text', 'JSON', 'JavaScript', 'HTML', 'XML', 'Yaml'] as const;
export type RawBodyType = (typeof RawBodyTypes)[number];

export type QueryParams = KeyValuePair<KeyValueValues>[];
export type SPHeaders = KeyValuePair[];

export type IdSpecificUiMetadata = {
	collapsed?: boolean;
	priority?: number;
};

export type ElementSpecificUiMetadata = {
	collapsed?: boolean;
};

export type UiMetadata = {
	idSpecific: Record<string, IdSpecificUiMetadata>;
};
