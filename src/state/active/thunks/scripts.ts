import { createAsyncThunk } from '@reduxjs/toolkit';
import { v4 } from 'uuid';
import { activeActions, activeThunkName } from '../slice';
import { RootState } from '@/state/store';
import { tabsActions } from '@/state/tabs/slice';
import { Script } from '@/types/data/workspace';
import { toValidFunctionName } from '@/utils/string';

export const deleteScriptById = createAsyncThunk<void, string, { state: RootState }>(
	`${activeThunkName}/deleteScriptById`,
	async (id, thunk) => {
		thunk.dispatch(tabsActions.closeTab(id));
		thunk.dispatch(activeActions.deleteScript({ scriptId: id }));
	},
);

export const createScript = createAsyncThunk<string, Partial<Omit<Script, 'id'>>, { state: RootState }>(
	`${activeThunkName}/createScript`,
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
