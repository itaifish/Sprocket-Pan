import { Settings } from '../settings/settings';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type Reference<TVariable extends string> = `{{${TVariable}}}`;
export const RESTfulRequestVerbs = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'] as const;
export type RESTfulRequestVerb = (typeof RESTfulRequestVerbs)[number];
export const RequestBodyTypes = ['none', 'form-data', 'x-www-form-urlencoded', 'raw'] as const;
export type RequestBodyType = (typeof RequestBodyTypes)[number];
export const RawBodyTypes = ['Text', 'JSON', 'JavaScript', 'HTML', 'XML'] as const;
export type RawBodyType = (typeof RawBodyTypes)[number];
export type EndpointRequest<TRequestBodyType extends RequestBodyType = RequestBodyType> = {
	id: string;
	endpointId: string;
	name: string;
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
	preRequestScript?: string;
	postRequestScript?: string;
	history: HistoricalEndpointResponse[];
};

export type HistoricalEndpointResponse = {
	request: EndpointRequest;
	response: EndpointResponse;
	dateTime: Date;
};

export type Endpoint<TUrlBase extends string = string> = {
	id: string;
	url: `${TUrlBase}${string}`;
	verb: RESTfulRequestVerb;
	baseHeaders: Record<string, string>;
	baseQueryParams: Record<string, string[]>;
	preRequestScript?: string;
	postRequestScript?: string;
	name: string;
	description: string;
	serviceId: string;
	requestIds: string[];
	defaultRequest: string | null;
};

export type Environment = {
	__name: string;
	__id: string;
	[key: string]: string;
};

export type Service<TBaseUrl extends string = string> = {
	id: string;
	name: string;
	description: string;
	version: string;
	baseUrl: TBaseUrl;
	localEnvironments: {
		[environmentName: string]: Environment;
	};
	selectedEnvironment?: string;
	endpointIds: string[];
	preRequestScript?: string;
};

export type ApplicationData = {
	services: Record<string, Service>;
	endpoints: Record<string, Endpoint>;
	requests: Record<string, EndpointRequest>;
	environments: Record<string, Environment>;
	selectedEnvironment?: string;
	settings: Settings;
};

export type EndpointResponse = {
	statusCode: number;
	body: string;
	bodyType: RawBodyType;
	headers: Record<string, string>;
};
