import { createAsyncThunk } from '@reduxjs/toolkit';
import { applicationDataManager } from '../../../managers/ApplicationDataManager';
import { Environment } from '../../../types/application-data/application-data';
import { RootState } from '../../store';
import { insertEnvironment, deleteEnvironmentFromState, setSavedNow } from '../slice';
import { createNewEnvironmentObject } from './util';
import { closeTab } from '../../tabs/slice';

interface AddNewEnvironment {
	data?: Partial<Omit<Environment, 'id'>>;
}

export const addNewEnvironment = createAsyncThunk<void, AddNewEnvironment, { state: RootState }>(
	'active/addEnvironment',
	async ({ data = {} }, thunk) => {
		const newEnvironment = {
			...createNewEnvironmentObject(),
			...data,
			__data: structuredClone(data.__data ?? []),
		} as unknown as Environment;
		thunk.dispatch(insertEnvironment(newEnvironment));
	},
);

export const addNewEnvironmentById = createAsyncThunk<void, string, { state: RootState }>(
	'active/addEnvironmentById',
	async (id, thunk) => {
		const environment = thunk.getState().active.environments[id];
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

export const saveActiveData = createAsyncThunk<void, void, { state: RootState }>(
	'active/saveData',
	async (_, thunk) => {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { lastModified, lastSaved, ...data } = thunk.getState().active;
		thunk.dispatch(setSavedNow());
		await applicationDataManager.saveData(data);
	},
);
