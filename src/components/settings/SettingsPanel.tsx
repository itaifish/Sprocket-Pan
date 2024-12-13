import { Box } from '@mui/joy';
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

export interface SettingsPanelProps {
	onClose: () => void;
}

export function SettingsPanel({ onClose }: SettingsPanelProps) {
	const lastSaved = useSelector(selectActiveState).lastSaved;
	const workspaceSettings = useSelector(selectWorkspaceSettings);
	const globalSettings = useSelector(selectGlobalSettings);
	const [unsavedSettings, setUnsavedSettings] = useState(workspaceSettings);
	const hasChanged = useMemo(() => {
		return JSON.stringify(workspaceSettings) !== JSON.stringify(unsavedSettings);
	}, [workspaceSettings, unsavedSettings]);
	const dispatch = useAppDispatch();
	function goToWorkspaceSelection() {
		dispatch(globalActions.setSelectedWorkspace(undefined));
	}

	return (
		<>
			<Box height="75vh">
				<SettingsTabs
					overlay={unsavedSettings}
					settings={globalSettings}
					onChange={(settings) => setUnsavedSettings(mergeDeep(unsavedSettings, settings))}
					goToWorkspaceSelection={goToWorkspaceSelection}
				/>
				<SettingsBar
					onSave={() => dispatch(activeActions.insertSettings(unsavedSettings))}
					onClose={onClose}
					overlay={unsavedSettings}
					settings={globalSettings}
					hasChanged={hasChanged}
					lastSaved={lastSaved}
				/>
			</Box>
		</>
	);
}
