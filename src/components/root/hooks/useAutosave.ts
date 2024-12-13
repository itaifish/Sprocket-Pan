import { selectSettings } from '@/state/active/selectors';
import { saveActiveData } from '@/state/active/thunks/data';
import { useAppDispatch } from '@/state/store';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';

export function useAutosave() {
	const settings = useSelector(selectSettings);
	const autosave = settings.data.autosave;
	const dispatch = useAppDispatch();
	useEffect(() => {
		if (!settings.data.autosave.enabled) return;
		const interval = setInterval(() => {
			dispatch(saveActiveData());
		}, settings.data.autosave.intervalMS);
		return () => {
			clearInterval(interval);
		};
	}, [autosave]);
}
