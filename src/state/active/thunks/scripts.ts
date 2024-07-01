import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../../store';
import { closeTab } from '../../tabs/slice';
import { deleteScript } from '../slice';

export const deleteScriptById = createAsyncThunk<void, string, { state: RootState }>(
	'active/deleteScriptById',
	async (id, thunk) => {
		thunk.dispatch(closeTab(id));
		thunk.dispatch(deleteScript({ scriptId: id }));
	},
);
