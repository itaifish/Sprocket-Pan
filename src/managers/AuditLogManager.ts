import { EventEmitter } from '@tauri-apps/api/shell';

export type RequestEvent = {
	timestamp: Date;
	chronology: 'before' | 'after';
	eventType: `${'pre' | 'post'}${'Service' | 'Endpoint' | 'Request'}Script` | 'request' | 'root';
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

type AuditEventEmitterListenerType = {
	update: (newEvent: RequestEvent) => void;
};

export class AuditLogManager extends EventEmitter<AuditUpdateEvent> {
	public static INSTANCE = new AuditLogManager();

	private constructor() {
		super();
	}

	addToAuditLog(
		auditLog: AuditLog,
		chronology: RequestEvent['chronology'],
		eventType: RequestEvent['eventType'],
		associatedId?: string,
		error?: string,
	) {
		const newRequestEvent: RequestEvent = {
			timestamp: new Date(),
			chronology,
			eventType,
			error,
			associatedId,
		};
		auditLog.push(newRequestEvent);
		this.emit('update', newRequestEvent);
	}

	getEventDataType(event: RequestEvent) {
		const dataTypes = ['Service', 'Endpoint', 'Request', 'request'] as const;
		for (const dt of dataTypes) {
			if (event.eventType.includes(dt)) {
				return dt.toLocaleLowerCase() as Lowercase<typeof dt>;
			}
		}
		return null;
	}

	transformAuditLog(auditLog: AuditLog): TransformedAuditLog | null {
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

	public on<T extends AuditUpdateEvent>(eventName: T, listener: AuditEventEmitterListenerType[T]): this {
		return super.on(eventName, listener);
	}

	public once<T extends AuditUpdateEvent>(eventName: T, listener: AuditEventEmitterListenerType[T]): this {
		return super.once(eventName, listener);
	}

	public off<T extends AuditUpdateEvent>(eventName: T, listener: AuditEventEmitterListenerType[T]): this {
		return super.off(eventName, listener);
	}
}

export const auditLogManager = AuditLogManager.INSTANCE;
