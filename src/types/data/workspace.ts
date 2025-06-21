import { KeyValuePair } from '../shared/keyValues';
import { SprocketError } from '../state/state';
import { RecursivePartial } from '../utils/utils';
import { AuditLog } from './audit';
import { Item } from './item';
import { Settings } from './settings';
import { QueryParams, RawBodyType, RequestBodyType, RESTfulRequestVerb, SPHeaders, UiMetadata } from './shared';

export interface WorkspaceMetadata extends Item {
	description: string;
	fileName: string;
	lastModified: number;
	minidenticon: string;
}

export interface EndpointResponse {
	statusCode: number;
	body: string;
	bodyType: RawBodyType;
	headers: SPHeaders;
	dateTime: number;
}

export interface Service<TBaseUrl extends string = string> extends Item {
	description: string;
	version: string;
	baseUrl: TBaseUrl;
	localEnvironments: {
		[environmentId: string]: Environment;
	};
	endpointIds: string[];
	preRequestScript?: string;
	postRequestScript?: string;
	linkedEnvMode?: boolean;
}

export interface Script extends Item {
	scriptCallableName: string;
	content: string;
}

export interface EndpointRequest<TRequestBodyType extends RequestBodyType = RequestBodyType> extends Item {
	endpointId: string;
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
}

export interface NetworkFetchRequest {
	method: RESTfulRequestVerb;
	url: string;
	headers: Record<string, string>;
	body: string;
	bodyType?: RawBodyType;
	dateTime: number;
}

export interface HistoricalEndpointResponse {
	request?: NetworkFetchRequest;
	response?: EndpointResponse;
	auditLog?: AuditLog;
	discard?: boolean;
	error?: SprocketError;
	timestamp: number;
}

export interface Endpoint<TUrlBase extends string = string> extends Item {
	url: `${TUrlBase}${string}`;
	verb: RESTfulRequestVerb;
	baseHeaders: SPHeaders;
	baseQueryParams: QueryParams;
	preRequestScript?: string;
	postRequestScript?: string;
	description: string;
	serviceId: string;
	requestIds: string[];
	defaultRequest: string | null;
}

export interface Environment extends Item {
	pairs: KeyValuePair[];
}

export interface RootEnvironment extends Environment {
	linked?: Record<string, string | null>;
	parents?: string[];
}

export interface SyncMetadata {
	items: Record<string, boolean>;
}

export type WorkspaceSettings = RecursivePartial<Settings>;

export interface WorkspaceItems {
	services: Record<string, Service>;
	endpoints: Record<string, Endpoint>;
	requests: Record<string, EndpointRequest>;
	environments: Record<string, RootEnvironment>;
	scripts: Record<string, Script>;
}

export interface WorkspaceSyncedData extends WorkspaceItems {
	secrets: KeyValuePair[];
}

export interface WorkspaceData extends WorkspaceItems {
	secrets: KeyValuePair[];
	selectedEnvironment?: string;
	selectedServiceEnvironments: Record<string, string | undefined>;
	settings: WorkspaceSettings;
	uiMetadata: UiMetadata;
	version: number | null;
	syncMetadata: SyncMetadata;
	history: Record<string, HistoricalEndpointResponse[]>;
}

export type WorkspaceItemType = keyof WorkspaceItems;
