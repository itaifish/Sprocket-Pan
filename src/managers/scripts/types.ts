import { EndpointRequest, EndpointResponse, HistoricalEndpointResponse, WorkspaceData } from '@/types/data/workspace';
import { AuditLog, RequestEvent } from '@/types/data/audit';
import { Interrupt } from '@/utils/types';

export interface RunTypeScriptReturn<T> {
	result: Promise<T>;
	interrupt: () => void;
}

// we define this here to help with monaco type-injection, but it's from '@tauri-apps/api/http'
type HttpVerb = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS' | 'CONNECT' | 'TRACE';

export type HttpOptions = {
	method: HttpVerb;
	headers?: Record<string, unknown>;
	query?: Record<string, unknown>;
	body?: Record<string, unknown>;
	timeout?: number;
};

export interface ScriptContext {
	requestId: string;
	response: EndpointResponse;
	auditLog?: AuditLog;
	type?: Exclude<RequestEvent['eventType'], 'request'>;
	associatedId?: string;
	name?: string;
}

export type OptionalScriptContext = Partial<ScriptContext>;

// this is mainly to facilitate monaco type injection.
// Inference works for ScriptInjectionManager, but defining it here allows
// monaco to pick up on it and it still to remain in sync with our code.

export interface SprocketInjectedScripts {
	// this will get replaced by actual user script typing in the type injection step
	interrupt: Interrupt;
	sleep: (ms: number) => Promise<void>;
	setEnvVariable: (key: string, value: string, level?: 'request' | 'service' | 'global') => void;
	setQueryParam: (key: string, value?: string | string[]) => void;
	setHeader: (key: string, value: string) => void;
	deleteHeader: (key: string) => void;
	sendRequest: (requestId: string) => Promise<EndpointResponse | undefined>;
	modifyRequest: (
		requestId: string,
		modifications: {
			body?: Record<string, unknown> | undefined;
			queryParams?: { key: string; value: string }[] | undefined;
			headers?: { key: string; value: string }[] | undefined;
		},
	) => void;
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
	readonly environment: Record<string, string>;
	readonly data: WorkspaceData;
	readonly response: HistoricalEndpointResponse | null;
	readonly request: EndpointRequest | null;
	readonly history: HistoricalEndpointResponse[] | null;
}
