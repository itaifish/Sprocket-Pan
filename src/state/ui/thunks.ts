import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { activeActions } from '../active/slice';

export const collapseAll = createAsyncThunk<void, string[], { state: RootState }>('ui/collapseAll', (ids, thunk) => {
	ids.forEach((id) => thunk.dispatch(activeActions.setUiMetadataById({ id, collapsed: true })));
});

export const expandAll = createAsyncThunk<void, string[], { state: RootState }>('ui/expandAll', (ids, thunk) => {
	ids.forEach((id) => thunk.dispatch(activeActions.setUiMetadataById({ id, collapsed: false })));
});
