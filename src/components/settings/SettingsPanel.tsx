import { Box, Button, Tab, TabList, TabPanel, Tabs } from '@mui/joy';
import { useMemo, useState } from 'react';
import NotInterestedIcon from '@mui/icons-material/NotInterested';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import { Settings } from '../../types/settings/settings';
import { useAppDispatch } from '../../state/store';
import { setSelectedWorkspace } from '../../state/workspaces/slice';
import { insertSettings } from '../../state/active/slice';
import { useSelector } from 'react-redux';
import { selectSettings } from '../../state/active/selectors';
import { AreYouSureModal } from '../shared/modals/AreYouSureModal';
import { DataTab } from './tabs/DataTab';
import { GeneralTab } from './tabs/GeneralTab';
import { ActionsTab } from './tabs/ActionsTab';

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
	function setSettings(settings: Partial<Settings>) {
		setUnsavedSettings({ ...unsavedSettings, ...settings });
	}
	const dispatch = useAppDispatch();
	function goToWorkspaceSelection() {
		dispatch(setSelectedWorkspace(undefined));
	}
	function saveSettings() {
		dispatch(insertSettings(unsavedSettings));
	}
	return (
		<>
			<Box>
				<Tabs aria-label="Settings Tabs" orientation="vertical" sx={{ minWidth: 300, minHeight: 160 }}>
					<TabList>
						<Tab>General</Tab>
						<Tab>Actions</Tab>
						<Tab>Data</Tab>
					</TabList>
					<TabPanel value={0}>
						<GeneralTab settings={unsavedSettings} setSettings={setSettings} />
					</TabPanel>
					<TabPanel value={1}>
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
				<Box
					sx={{
						display: 'flex',
						flexDirection: 'row-reverse',
					}}
				>
					<Button startDecorator={<ThumbUpAltIcon />} disabled={!hasChanged} onClick={saveSettings}>
						Apply
					</Button>
					<Button
						color={hasChanged ? 'danger' : 'warning'}
						startDecorator={hasChanged ? <NotInterestedIcon /> : <ExitToAppIcon />}
						sx={{ mr: '10px' }}
						onClick={props.closePanel}
					>
						{hasChanged ? 'Cancel' : 'Close'}
					</Button>
				</Box>
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
