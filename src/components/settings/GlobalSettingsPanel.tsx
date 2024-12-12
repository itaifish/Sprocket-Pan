import { Box } from '@mui/joy';
import { useMemo, useState } from 'react';
import { useAppDispatch } from '../../state/store';
import { useSelector } from 'react-redux';
import { globalActions } from '../../state/global/slice';
import { mergeDeep } from '../../utils/variables';
import { SettingsTabs } from './tabs/SettingsTabs';
import { SettingsBar } from './SettingsBar';
import { SettingsPanelProps } from './SettingsPanel';
import { selectGlobalLastSaved, selectGlobalSettings } from '../../state/global/selectors';

export function GlobalSettingsPanel({ onClose }: SettingsPanelProps) {
	const lastSaved = useSelector(selectGlobalLastSaved);
	const previousSettings = useSelector(selectGlobalSettings);
	const [unsavedSettings, setUnsavedSettings] = useState(previousSettings);
	const hasChanged = useMemo(() => {
		return JSON.stringify(previousSettings) !== JSON.stringify(unsavedSettings);
	}, [previousSettings, unsavedSettings]);
	const dispatch = useAppDispatch();
	return (
		<Box height="75vh">
			<SettingsTabs
				settings={unsavedSettings}
				onChange={(settings) => setUnsavedSettings(mergeDeep(unsavedSettings, settings))}
			/>
			<SettingsBar
				onSave={() => dispatch(globalActions.insertSettings(unsavedSettings))}
				onClose={onClose}
				settings={unsavedSettings}
				hasChanged={hasChanged}
				lastSaved={lastSaved}
			/>
		</Box>
	);
}
