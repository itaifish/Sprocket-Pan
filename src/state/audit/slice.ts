import { auditLogManager } from '@/managers/AuditLogManager';
import { AuditLog, RequestEvent } from '@/types/data/audit';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type AuditLogState = Map<string, AuditLog>;
const initialAuditLogSliceState: AuditLogState = new Map();
type UpdateAuditLogPayload = {
	chronology: RequestEvent['chronology'];
	eventType: RequestEvent['eventType'];
	eventId: string;
	associatedId?: string;
	error?: string;
};
export const auditLogSlice = createSlice({
	name: 'auditLog',
	initialState: initialAuditLogSliceState,
	reducers: {
		addToAuditLog: (state, action: PayloadAction<UpdateAuditLogPayload>) => {
			let auditLog = state.get(action.payload.eventId);
			if (auditLog == undefined) {
				auditLog = [];
				state.set(action.payload.eventId, auditLog);
			}
			auditLogManager.addToAuditLog(
				auditLog,
				action.payload.chronology,
				action.payload.eventType,
				action.payload.associatedId,
			);
		},
		clearAuditLogEntry: (state, action: PayloadAction<string>) => {
			state.delete(action.payload);
		},
	},
});

export const auditActions = auditLogSlice.actions;
