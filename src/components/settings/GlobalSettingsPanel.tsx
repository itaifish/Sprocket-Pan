import { Box, Stack } from '@mui/joy';
import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { SettingsTabs } from './tabs/SettingsTabs';
import { SettingsBar } from './SettingsBar';
import { SettingsPanelProps } from './SettingsPanel';
import { selectGlobalLastSaved, selectGlobalSettings } from '@/state/global/selectors';
import { globalActions } from '@/state/global/slice';
import { useAppDispatch } from '@/state/store';
import { mergeDeep } from '@/utils/variables';
import { SettingsTitle } from './SettingsTitle';

export function GlobalSettingsPanel({ onClose }: SettingsPanelProps) {
	const lastSaved = useSelector(selectGlobalLastSaved);
	const previousSettings = useSelector(selectGlobalSettings);
	const [unsavedSettings, setUnsavedSettings] = useState(previousSettings);
	const hasChanged = useMemo(() => {
		return JSON.stringify(previousSettings) !== JSON.stringify(unsavedSettings);
	}, [previousSettings, unsavedSettings]);
	const dispatch = useAppDispatch();
	const [search, setSearch] = useState('');
	return (
		<Stack height="75vh" justifyContent="stretch" alignItems="stretch" gap={1}>
			<SettingsTitle onChange={setSearch} />
			<Box sx={{ flex: 1, overflow: 'auto' }}>
				<SettingsTabs
					searchText={search}
					settings={unsavedSettings}
					onChange={(settings) => setUnsavedSettings(mergeDeep(unsavedSettings, settings))}
					onUpdateGlobal={() => undefined}
				/>
			</Box>
			<SettingsBar
				onSave={() => dispatch(globalActions.insertSettings(unsavedSettings))}
				onClose={onClose}
				settings={unsavedSettings}
				hasChanged={hasChanged}
				lastSaved={lastSaved}
			/>
		</Stack>
	);
}
