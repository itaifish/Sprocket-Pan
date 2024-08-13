import { createAsyncThunk } from '@reduxjs/toolkit';
import { Environment } from '../../../types/application-data/application-data';
import { RootState } from '../../store';
import { insertEnvironment, deleteEnvironmentFromState } from '../slice';
import { createNewEnvironmentObject } from './util';
import { closeTab } from '../../tabs/slice';

interface AddNewEnvironment {
	data?: Partial<Omit<Environment, '__id'>>;
}

export const addNewEnvironment = createAsyncThunk<string, AddNewEnvironment, { state: RootState }>(
	'active/addEnvironment',
	async ({ data = {} }, thunk) => {
		const newEnvironment = {
			...createNewEnvironmentObject(),
			...data,
			__data: structuredClone(data.__data ?? []),
		} as unknown as Environment;
		thunk.dispatch(insertEnvironment(newEnvironment));
		return newEnvironment.__id;
	},
);

export const addNewEnvironmentById = createAsyncThunk<void, string, { state: RootState }>(
	'active/addEnvironmentById',
	async (oldId, thunk) => {
		const { __id, ...environment } = thunk.getState().active.environments[oldId];
		thunk.dispatch(addNewEnvironment({ data: environment }));
	},
);

export const deleteEnvironmentById = createAsyncThunk<void, string, { state: RootState }>(
	'active/deleteEnvironmentById',
	async (id, thunk) => {
		thunk.dispatch(closeTab(id));
		thunk.dispatch(deleteEnvironmentFromState(id));
	},
);
