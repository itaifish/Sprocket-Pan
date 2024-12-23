import { EndpointRequest, EndpointResponse, HistoricalEndpointResponse, WorkspaceData } from '@/types/data/workspace';

// this is mainly to facilitate monaco type injection.
// Inference works for ScriptInjectionManager, but defining it here allows
// monaco to pick up on it and it still to remain in sync with our code.

export interface SprocketInjectedScripts {
	setEnvironmentVariable: (key: string, value: string, level?: 'request' | 'service' | 'global') => void;
	setQueryParam: (key: string, value?: string | string[]) => void;
	setHeader: (key: string, value: string) => void;
	deleteHeader: (key: string) => void;
	getEnvironment: () => Record<string, string>;
	sendRequest: (requestId: string) => Promise<EndpointResponse>;
	modifyRequest: (
		requestId: string,
		modifications: {
			body?: Record<string, unknown> | undefined;
			queryParams?: { key: string; value: string }[] | undefined;
			headers?: { key: string; value: string }[] | undefined;
		},
	) => void;
	readonly data: WorkspaceData;
	readonly response: HistoricalEndpointResponse | null;
	readonly activeRequest: EndpointRequest | null;
	readonly fetch: <T>(
		url: string,
		request: {
			method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS' | 'CONNECT' | 'TRACE';
			headers?: Record<string, unknown> | undefined;
			query?: Record<string, unknown> | undefined;
			body?: Record<string, unknown> | undefined;
			timeout?: number | undefined;
		},
	) => Promise<{
		url: string;
		status: number;
		ok: boolean;
		headers: Record<string, string>;
		rawHeaders: Record<string, string[]>;
		data: T;
	}>;
}
