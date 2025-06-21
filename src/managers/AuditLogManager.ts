import { AuditLog, RequestEvent, TransformedAuditLog } from '../types/data/audit';
import { OptionalScriptContext } from './scripts/types';

export class AuditLogManager {
	static addToAuditLogFromContext(
		context: OptionalScriptContext,
		chronology: RequestEvent['chronology'],
		error?: string,
	) {
		if (context.auditLog != null) {
			this.addToAuditLog(context.auditLog, chronology, context.type, context.associatedId, error);
		}
	}

	static addToAuditLog(
		auditLog: AuditLog,
		chronology: RequestEvent['chronology'],
		eventType?: RequestEvent['eventType'],
		associatedId?: string,
		error?: string,
	) {
		const newRequestEvent: RequestEvent = {
			timestamp: new Date().getTime(),
			chronology,
			eventType: eventType ?? 'unknown',
			error,
			associatedId,
		};
		auditLog.push(newRequestEvent);
	}

	static getEventDataType(event: RequestEvent) {
		const dataTypes = ['Service', 'Endpoint', 'Request', 'request'] as const;
		if (event.eventType === 'standaloneScript') {
			return 'script';
		}
		for (const dt of dataTypes) {
			if (event.eventType.includes(dt)) {
				return dt.toLocaleLowerCase() as Lowercase<typeof dt>;
			}
		}
		return null;
	}

	static transformAuditLog(auditLog: AuditLog): TransformedAuditLog | null {
		if (auditLog.length == 0) {
			return null;
		}
		const resRoot: TransformedAuditLog = {
			before: { chronology: 'before', eventType: 'root', timestamp: auditLog[0].timestamp },
			after: { chronology: 'after', eventType: 'root', timestamp: auditLog[auditLog.length - 1].timestamp },
			innerEvents: [],
		};
		const stack: TransformedAuditLog[] = [resRoot];
		for (const event of auditLog) {
			if (event.chronology == 'before') {
				stack.push({ before: event, after: null as unknown as RequestEvent, innerEvents: [] });
			} else {
				const transformedLogToComplete = stack.pop() as TransformedAuditLog;
				transformedLogToComplete.after = event;
				if (stack.length != 0) {
					stack[stack.length - 1].innerEvents.push(transformedLogToComplete);
				}
			}
		}
		return resRoot;
	}
}
