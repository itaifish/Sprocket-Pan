import { createAsyncThunk } from '@reduxjs/toolkit';
import { Environment } from '../../../types/application-data/application-data';
import { RootState } from '../../store';
import {
	insertEnvironment,
	deleteEnvironmentFromState,
	removeLinkedEnv,
	addLinkedEnv,
	UpdateLinkedEnv,
} from '../slice';
import { tabsActions } from '../../tabs/slice';
import { cloneEnv } from '../../../utils/application';

interface AddNewEnvironment {
	data?: Partial<Omit<Environment, 'id'>> | null;
}

export const addNewEnvironment = createAsyncThunk<string, AddNewEnvironment | undefined, { state: RootState }>(
	'active/addEnvironment',
	async ({ data } = {}, thunk) => {
		const newEnvironment = cloneEnv({ name: 'New Environment', ...data });
		thunk.dispatch(insertEnvironment(newEnvironment));
		return newEnvironment.id;
	},
);

export const addNewEnvironmentById = createAsyncThunk<string, string, { state: RootState }>(
	'active/addEnvironmentById',
	async (oldId, thunk) => {
		const { id, ...environment } = thunk.getState().active.environments[oldId];
		return await thunk.dispatch(addNewEnvironment({ data: environment })).unwrap();
	},
);

export const deleteEnvironmentById = createAsyncThunk<void, string, { state: RootState }>(
	'active/deleteEnvironmentById',
	async (id, thunk) => {
		thunk.dispatch(tabsActions.closeTab(id));
		thunk.dispatch(deleteEnvironmentFromState(id));
	},
);

interface RelinkEnvironmentsArgs extends Omit<UpdateLinkedEnv, 'envId'> {
	remove: string[];
	add: string[];
}

export const relinkEnvironments = createAsyncThunk<void, RelinkEnvironmentsArgs, { state: RootState }>(
	'active/deleteEnvironmentById',
	async ({ remove, add, serviceEnvId, serviceId }, thunk) => {
		remove.forEach((envId) => thunk.dispatch(removeLinkedEnv({ envId, serviceEnvId, serviceId })));
		add.forEach((envId) => thunk.dispatch(addLinkedEnv({ envId, serviceEnvId, serviceId })));
	},
);
