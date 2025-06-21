import { StateAccess } from '@/state/types';

export class StateAccessManager {
	static stateAccess: StateAccess | null = null;
	static get dispatch() {
		if (this.stateAccess == null) {
			throw new Error('state is not loaded');
		}
		return this.stateAccess.dispatch;
	}
	static get getState() {
		if (this.stateAccess == null) {
			throw new Error('state is not loaded');
		}
		return this.stateAccess.getState;
	}
}
