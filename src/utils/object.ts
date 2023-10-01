import { SelectedRequest } from '../types/state/state';

export function selectedRequestEquals(r1: SelectedRequest, r2: SelectedRequest) {
	return r1.endpoint === r2.endpoint && r1.request === r2.request && r1.service === r2.service;
}
