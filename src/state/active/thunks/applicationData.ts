import { createAsyncThunk } from '@reduxjs/toolkit';

export const InjectLoadedData = createAsyncThunk<void, ParsedServiceApplicationData, { state: RootState }>(
	'active/injectLoadedData',
	(loadedData) => {
		
	},
);
