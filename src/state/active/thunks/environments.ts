import { createAsyncThunk } from '@reduxjs/toolkit';
import { applicationDataManager } from '../../../managers/ApplicationDataManager';
import { Environment } from '../../../types/application-data/application-data';
import { RootState } from '../../store';
import { insertEnvironment, deleteEnvironmentFromState, setSavedNow } from '../slice';
import { createNewEnvironmentObject } from './util';

interface AddNewEnvironment {
	data?: Partial<Omit<Environment, 'id'>>;
}

// TODO: what is up with this and why is the typing broken
export const addNewEnvironment = createAsyncThunk<void, AddNewEnvironment, { state: RootState }>(
	'active/addEnvironment',
	async ({ data = {} }, thunk) => {
		const newEnvironment = {
			...createNewEnvironmentObject(),
			...data,
			__data: structuredClone(data.__data ?? []),
		};
		await thunk.dispatch(insertEnvironment(newEnvironment));
	},
);

export const deleteEnvironment = deleteEnvironmentFromState;

export const saveActiveData = createAsyncThunk<void, void, { state: RootState }>(
	'active/saveData',
	async (_, thunk) => {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { lastModified, lastSaved, ...data } = thunk.getState().active;
		await thunk.dispatch(setSavedNow());
		await applicationDataManager.saveData(data);
	},
);
