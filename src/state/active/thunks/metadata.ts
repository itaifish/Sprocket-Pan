import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../../store';
import { saveActiveData } from './applicationData';
import { activeActions } from '../slice';

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
		thunk.dispatch(activeActions.setAutosaveInterval(newIntervalProcess));
	},
);
