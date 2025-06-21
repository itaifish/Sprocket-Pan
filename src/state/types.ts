import { PayloadAction } from '@reduxjs/toolkit';
import { AppDispatch, RootState } from './store';

/**
 * This a TEMPORARY type that exists to facilitate the transition from a manager-based
 * way of doing things to a state-driven way of doing things. This allows partial conversion.
 * _nothing_ should be added that uses this type.
 * @deprecated
 */
export interface StateAccess {
	getState: () => RootState;
	dispatch: AppDispatch;
}

export type Update<T extends { id: string }> = Partial<T> & { id: string };
export type Create<T> = Partial<T> | undefined;

export type PayloadUpdate<T extends { id: string }> = PayloadAction<Update<T>>;
