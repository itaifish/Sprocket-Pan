import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectSettings } from '../../../state/active/selectors';
import { saveActiveData } from '../../../state/active/thunks/applicationData';
import { useAppDispatch } from '../../../state/store';

export function useAutosave() {
	const settings = useSelector(selectSettings);
	const dispatch = useAppDispatch();
	useEffect(() => {
		if (settings.autoSaveIntervalMS == null) return;
		const interval = setInterval(() => {
			dispatch(saveActiveData());
		}, settings.autoSaveIntervalMS);
		return () => {
			clearInterval(interval);
		};
	}, [settings.autoSaveIntervalMS]);
}
