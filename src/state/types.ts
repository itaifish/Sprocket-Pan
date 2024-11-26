import { WorkspaceData } from '../types/application-data/application-data';
import { AppDispatch } from './store';

/**
 * This a TEMPORARY type that exists to facilitate the transition from a manager-based
 * way of doing things to a state-driven way of doing things. This allows partial conversion.
 * _nothing_ should be added that uses this type.
 * @deprecated
 */
export interface StateAccess {
	getState: () => WorkspaceData;
	dispatch: AppDispatch;
}
