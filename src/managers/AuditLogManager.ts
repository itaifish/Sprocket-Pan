export type RequestEvent = {
	timestamp: Date;
	chronology: 'before' | 'after';
	eventType: `${'pre' | 'post'}${'Service' | 'Endpoint' | 'Request'}Script` | 'request';
	associatedId?: string;
	error?: string;
};

export type AuditLog = RequestEvent[];

export function addToAuditLog(
	auditLog: AuditLog,
	chronology: RequestEvent['chronology'],
	eventType: RequestEvent['eventType'],
	associatedId?: string,
	error?: string,
) {
	auditLog.push({
		timestamp: new Date(),
		chronology,
		eventType,
		error,
		associatedId,
	});
}
