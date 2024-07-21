import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../../store';
import { closeTab } from '../../tabs/slice';
import { addScript, deleteScript } from '../slice';
import { Script } from '../../../types/application-data/application-data';
import { v4 } from 'uuid';
import { toValidFunctionName } from '../../../utils/string';

export const deleteScriptById = createAsyncThunk<void, string, { state: RootState }>(
	'active/deleteScriptById',
	async (id, thunk) => {
		thunk.dispatch(closeTab(id));
		thunk.dispatch(deleteScript({ scriptId: id }));
	},
);

export const createScript = createAsyncThunk<string, Partial<Omit<Script, 'id'>>, { state: RootState }>(
	'active/addScript',
	async (newScriptData, thunk) => {
		const newId = v4();
		const newScript = {
			content: '',
			name: 'New Script',
			scriptCallableName: toValidFunctionName(newScriptData?.name ?? 'newScript'),
			returnVariableName: null,
			...newScriptData,
			id: newId,
		};
		thunk.dispatch(addScript(newScript));
		return newId;
	},
);
