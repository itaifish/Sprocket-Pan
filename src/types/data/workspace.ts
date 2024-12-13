import { KeyValuePair } from '@/classes/OrderedKeyValuePairs';
import { RecursivePartial } from '../utils/utils';
import { AuditLog } from './audit';
import { Settings } from './settings';
import { QueryParams, RawBodyType, RequestBodyType, RESTfulRequestVerb, SPHeaders, UiMetadata } from './shared';

export type WorkspaceMetadata = {
	name: string;
	description: string;
	fileName: string;
	lastModified: number;
};

export type EndpointResponse = {
	statusCode: number;
	body: string;
	bodyType: RawBodyType;
	headers: SPHeaders;
	dateTime: number;
};

export type Service<TBaseUrl extends string = string> = {
	id: string;
	name: string;
	description: string;
	version: string;
	baseUrl: TBaseUrl;
	localEnvironments: {
		[environmentId: string]: Environment;
	};
	selectedEnvironment?: string;
	endpointIds: string[];
	preRequestScript?: string;
	postRequestScript?: string;
	linkedEnvMode?: boolean;
};

export type Script = {
	name: string;
	scriptCallableName: string;
	returnVariableName: string | null;
	returnVariableType?: {
		isClass?: boolean;
		typeText: string;
	};
	id: string;
	content: string;
};

export type EndpointRequest<TRequestBodyType extends RequestBodyType = RequestBodyType> = {
	id: string;
	endpointId: string;
	name: string;
	headers: SPHeaders;
	queryParams: QueryParams;
	bodyType: TRequestBodyType;
	body: TRequestBodyType extends 'none'
		? undefined
		: TRequestBodyType extends 'raw'
			? string
			: TRequestBodyType extends 'form-data' | 'x-www-form-urlencoded'
				? Record<string, string>
				: Record<string, string> | string | undefined;
	rawType: TRequestBodyType extends 'raw'
		? RawBodyType
		: TRequestBodyType extends 'none' | 'form-data' | 'x-www-form-urlencoded'
			? undefined
			: RawBodyType | undefined;
	preRequestScript?: string;
	postRequestScript?: string;
	environmentOverride: Environment;
	history: HistoricalEndpointResponse[];
};

export type NetworkFetchRequest = {
	method: RESTfulRequestVerb;
	url: string;
	headers: Record<string, string>;
	body: string;
	bodyType?: RawBodyType;
	dateTime: number;
};

export type HistoricalEndpointResponse = {
	request: NetworkFetchRequest;
	response: EndpointResponse;
	auditLog?: AuditLog;
};

export type Endpoint<TUrlBase extends string = string> = {
	id: string;
	url: `${TUrlBase}${string}`;
	verb: RESTfulRequestVerb;
	baseHeaders: SPHeaders;
	baseQueryParams: QueryParams;
	preRequestScript?: string;
	postRequestScript?: string;
	name: string;
	description: string;
	serviceId: string;
	requestIds: string[];
	defaultRequest: string | null;
};

export type Environment = {
	name: string;
	id: string;
	pairs: KeyValuePair[];
};

export type RootEnvironment = Environment & { linked?: Record<string, string | null>; parents?: string[] };

export type WorkspaceData = {
	services: Record<string, Service>;
	endpoints: Record<string, Endpoint>;
	requests: Record<string, EndpointRequest>;
	environments: Record<string, RootEnvironment>;
	secrets: KeyValuePair[];
	scripts: Record<string, Script>;
	selectedEnvironment?: string;
	settings: RecursivePartial<Settings>;
	metadata: WorkspaceMetadata;
	uiMetadata: UiMetadata;
	version: number | null;
};
