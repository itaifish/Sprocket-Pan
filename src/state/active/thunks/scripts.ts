import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../../store';
import { Script } from '../../../types/application-data/application-data';
import { v4 } from 'uuid';
import { toValidFunctionName } from '../../../utils/string';
import { tabsActions } from '../../tabs/slice';
import { activeActions } from '../slice';

export const deleteScriptById = createAsyncThunk<void, string, { state: RootState }>(
	'active/deleteScriptById',
	async (id, thunk) => {
		thunk.dispatch(tabsActions.closeTab(id));
		thunk.dispatch(activeActions.deleteScript({ scriptId: id }));
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
		thunk.dispatch(activeActions.insertScript(newScript));
		return newId;
	},
);
