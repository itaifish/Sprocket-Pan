import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../../store';
import { setAutosaveInterval } from '../slice';
import { saveActiveData } from './applicationData';

export const updateAutosaveInterval = createAsyncThunk<void, number | undefined, { state: RootState }>(
	'active/updateAutosaveInterval',
	(newInterval, thunk) => {
		let newIntervalProcess: NodeJS.Timeout | undefined = undefined;
		if (newInterval != undefined) {
			newIntervalProcess = setInterval(() => {
				// TODO: Only save if the data has been modified
				thunk.dispatch(saveActiveData());
			}, newInterval);
		}
		thunk.dispatch(setAutosaveInterval(newIntervalProcess));
	},
);
