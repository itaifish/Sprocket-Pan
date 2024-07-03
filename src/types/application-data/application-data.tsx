import { AuditLog } from '../../managers/AuditLogManager';
import { Settings } from '../settings/settings';
import TableChartIcon from '@mui/icons-material/TableChart';
import FolderOpenSharpIcon from '@mui/icons-material/FolderOpenSharp';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import { TabType } from '../state/state';
import CodeIcon from '@mui/icons-material/Code';

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
	headers: SPHeaders;
	body: Record<string, unknown>;
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

export type OrderedKeyValuePair<
	TKey extends string | number = string,
	TVal = string,
	IsUnique extends boolean = true,
> = {
	__data: { key: TKey; value: TVal }[];
} & Record<TKey, IsUnique extends true ? TVal : TVal[]>;
export type Environment = {
	__name: string;
	__id: string;
} & OrderedKeyValuePair;
export type QueryParams = OrderedKeyValuePair<string, string, false>;
export type SPHeaders = OrderedKeyValuePair;

export const EMPTY_QUERY_PARAMS: QueryParams = {
	__data: [],
} as unknown as QueryParams;

export const EMPTY_ENVIRONMENT: Environment = {
	__data: [],
} as unknown as Environment;

export const EMPTY_HEADERS: SPHeaders = {
	__data: [],
} as unknown as SPHeaders;

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
	postRequestScript?: string;
};

export type WorkspaceMetadata = {
	name: string;
	description: string;
	// undefined is the default workspace
	fileName: string | undefined;
	lastModified: number;
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

export type ApplicationData = {
	services: Record<string, Service>;
	endpoints: Record<string, Endpoint>;
	requests: Record<string, EndpointRequest>;
	environments: Record<string, Environment>;
	scripts: Record<string, Script>;
	selectedEnvironment?: string;
	settings: Settings;
	workspaceMetadata?: WorkspaceMetadata;
};

export type EndpointResponse = {
	statusCode: number;
	body: string;
	bodyType: RawBodyType;
	headers: Record<string, string>;
	dateTime: number;
};

export const iconFromTabType: Record<TabType, JSX.Element> = {
	endpoint: <FolderOpenIcon />,
	environment: <TableChartIcon />,
	request: <TextSnippetIcon />,
	service: <FolderOpenSharpIcon />,
	script: <CodeIcon />,
};
