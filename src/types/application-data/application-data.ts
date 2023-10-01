import { Settings } from '../settings/settings';

type Reference<TVariable extends string> = `{{${TVariable}}}`;
export const RESTfulRequestVerbs = ['POST', 'GET', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'] as const;
export type RESTfulRequestVerb = (typeof RESTfulRequestVerbs)[number];
const RequestBodyTypes = ['none', 'form-data', 'x-www-form-urlencoded', 'raw'] as const;
export type RequestBodyType = (typeof RequestBodyTypes)[number];
const RawBodyTypes = ['Text', 'JSON', 'JavaScript', 'HTML', 'XML'] as const;
export type RawBodyType = (typeof RawBodyTypes)[number];
type EndpointRequest<TRequestBodyType extends RequestBodyType> = {
	headers: Record<string, string>;
	queryParams: Record<string, string[]>;
	bodyType: TRequestBodyType;
	body: TRequestBodyType extends 'none'
		? undefined
		: TRequestBodyType extends 'raw'
		? string
		: TRequestBodyType extends 'form-data' | 'x-www-form-urlencoded'
		? Map<string, string>
		: Map<string, string> | string | undefined;
	rawType: TRequestBodyType extends 'raw'
		? RawBodyType
		: TRequestBodyType extends 'none' | 'form-data' | 'x-www-form-urlencoded'
		? undefined
		: RawBodyType | undefined;
};
export type Endpoint<
	TUrlBase extends string = string,
	TEndpointRequests extends Array<EndpointRequest<RequestBodyType>> = Array<EndpointRequest<RequestBodyType>>,
> = {
	url: `${TUrlBase}${string}`;
	verb: RESTfulRequestVerb;
	baseHeaders: Record<string, string>;
	baseQueryParams: Record<string, string[]>;
	requests: TEndpointRequests;
	preRequestScript?: string;
	name: string;
	description: string;
};

export type Environment = {
	[key: string]: string;
};

export type Service<TBaseUrl extends string = string> = {
	name: string;
	description: string;
	version: string;
	baseUrl: TBaseUrl;
	endpoints: {
		[endpointName: string]: Endpoint<TBaseUrl>;
	};
	localEnvironments: {
		[environmentName: string]: Environment;
	};
	preRequestScript?: string;
};

export type ApplicationData = {
	services: Record<string, Service>;
	settings: Settings;
};
