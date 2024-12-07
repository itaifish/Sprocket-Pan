import { Box, Button, Stack, Tab, TabList, TabPanel, Tabs } from '@mui/joy';
import { useMemo, useState } from 'react';
import NotInterestedIcon from '@mui/icons-material/NotInterested';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import { Settings } from '../../types/settings/settings';
import { useAppDispatch } from '../../state/store';
import { useSelector } from 'react-redux';
import { selectSettings } from '../../state/active/selectors';
import { AreYouSureModal } from '../shared/modals/AreYouSureModal';
import { DataTab } from './tabs/DataTab';
import { GeneralTab } from './tabs/GeneralTab';
import { ActionsTab } from './tabs/ActionsTab';
import { globalActions } from '../../state/global/slice';
import { RecursivePartial } from '../../types/utils/utils';
import { mergeDeep } from '../../utils/variables';
import { activeActions } from '../../state/active/slice';

interface SettingsPanelProps {
	closePanel: () => void;
}

export const SettingsPanel = (props: SettingsPanelProps) => {
	const previousSettings = useSelector(selectSettings);
	const [unsavedSettings, setUnsavedSettings] = useState(previousSettings);
	const [quitWithoutSavingModalOpen, setQuitWithoutSavingModalOpen] = useState(false);
	const hasChanged = useMemo(() => {
		return JSON.stringify(previousSettings) !== JSON.stringify(unsavedSettings);
	}, [previousSettings, unsavedSettings]);
	function setSettings(settings: RecursivePartial<Settings>) {
		setUnsavedSettings(mergeDeep(unsavedSettings, settings));
	}
	const dispatch = useAppDispatch();
	function goToWorkspaceSelection() {
		dispatch(globalActions.setSelectedWorkspace(undefined));
	}
	function saveSettings() {
		dispatch(activeActions.insertSettings(unsavedSettings));
	}
	return (
		<>
			<Box height="75vh">
				<Tabs aria-label="Settings Tabs" orientation="vertical" sx={{ height: 'calc(100% - 30px)' }}>
					<TabList>
						<Tab>General</Tab>
						<Tab>Actions</Tab>
						<Tab>Data</Tab>
					</TabList>
					<TabPanel value={0}>
						<GeneralTab settings={unsavedSettings} setSettings={setSettings} />
					</TabPanel>
					<TabPanel sx={{ height: '100%', overflowY: 'auto' }} value={1}>
						<ActionsTab settings={unsavedSettings} setSettings={setSettings} />
					</TabPanel>
					<TabPanel value={2}>
						<DataTab
							settings={unsavedSettings}
							setSettings={setSettings}
							onQuit={() => setQuitWithoutSavingModalOpen(true)}
							goToWorkspaceSelection={goToWorkspaceSelection}
						/>
					</TabPanel>
				</Tabs>
				<Stack gap={1} direction="row" justifyContent="end" mt={1}>
					<Button
						color={hasChanged ? 'danger' : 'warning'}
						startDecorator={hasChanged ? <NotInterestedIcon /> : <ExitToAppIcon />}
						onClick={props.closePanel}
					>
						{hasChanged ? 'Cancel' : 'Close'}
					</Button>
					<Button startDecorator={<ThumbUpAltIcon />} disabled={!hasChanged} onClick={saveSettings}>
						Apply
					</Button>
				</Stack>
			</Box>
			<AreYouSureModal
				open={quitWithoutSavingModalOpen}
				closeFunc={() => {
					setQuitWithoutSavingModalOpen(false);
				}}
				action="Quit Without Saving"
				actionFunc={() => {
					goToWorkspaceSelection();
				}}
			/>
		</>
	);
};
