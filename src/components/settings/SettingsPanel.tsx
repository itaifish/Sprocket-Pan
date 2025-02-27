import { Box, Stack } from '@mui/joy';
import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { SettingsTabs } from './tabs/SettingsTabs';
import { SettingsBar } from './SettingsBar';
import { selectActiveState, selectWorkspaceSettings } from '@/state/active/selectors';
import { activeActions } from '@/state/active/slice';
import { selectGlobalSettings } from '@/state/global/selectors';
import { globalActions } from '@/state/global/slice';
import { useAppDispatch } from '@/state/store';
import { mergeDeep } from '@/utils/variables';
import { clearLeafProperties } from '@/utils/functions';
import { SettingsTitle } from './SettingsTitle';

export interface SettingsPanelProps {
	onClose: () => void;
}

export function SettingsPanel({ onClose }: SettingsPanelProps) {
	const lastSaved = useSelector(selectActiveState).lastSaved;
	const workspaceSettings = useSelector(selectWorkspaceSettings);
	const globalSettings = useSelector(selectGlobalSettings);
	const [unsavedSettings, setUnsavedSettings] = useState(workspaceSettings);
	const [unsavedGlobalSettings, setUnsavedGlobalSettings] = useState(globalSettings);
	const hasChanged = useMemo(() => {
		return (
			JSON.stringify(workspaceSettings) !== JSON.stringify(unsavedSettings) ||
			JSON.stringify(globalSettings) !== JSON.stringify(unsavedGlobalSettings)
		);
	}, [workspaceSettings, unsavedSettings, globalSettings, unsavedGlobalSettings]);
	const dispatch = useAppDispatch();
	function goToWorkspaceSelection() {
		dispatch(globalActions.setSelectedWorkspace(undefined));
	}
	const [search, setSearch] = useState('');
	return (
		<Stack height="75vh" justifyContent="stretch" alignItems="stretch" gap={1}>
			<SettingsTitle onChange={setSearch} />
			<Box sx={{ flex: 1, overflow: 'auto' }}>
				<SettingsTabs
					searchText={search}
					overlay={unsavedSettings}
					settings={unsavedGlobalSettings}
					onChange={(settings) => setUnsavedSettings(mergeDeep(unsavedSettings, settings, { allowUndefined: true }))}
					onUpdateGlobal={(settings) => {
						setUnsavedGlobalSettings(mergeDeep(unsavedGlobalSettings, settings));
						const nullOverride = structuredClone(settings);
						clearLeafProperties(nullOverride, undefined);
						setUnsavedSettings(mergeDeep(unsavedSettings, nullOverride, { allowUndefined: true }));
					}}
					goToWorkspaceSelection={goToWorkspaceSelection}
				/>
			</Box>
			<SettingsBar
				onSave={() => {
					dispatch(activeActions.insertSettings(unsavedSettings));
					dispatch(globalActions.insertSettings(unsavedGlobalSettings));
				}}
				onClose={onClose}
				overlay={unsavedSettings}
				settings={unsavedGlobalSettings}
				hasChanged={hasChanged}
				lastSaved={lastSaved}
			/>
		</Stack>
	);
}
