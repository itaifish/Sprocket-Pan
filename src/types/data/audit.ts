export type RequestEvent = {
	timestamp: number;
	chronology: 'before' | 'after';
	eventType: `${'pre' | 'post'}${'Service' | 'Endpoint' | 'Request'}Script` | 'request' | 'root' | 'standaloneScript';
	associatedId?: string;
	error?: string;
};

export type AuditLog = RequestEvent[];

export type AuditUpdateEvent = 'update';

export type TransformedAuditLog = {
	before: RequestEvent;
	after: RequestEvent;
	innerEvents: TransformedAuditLog[];
};
