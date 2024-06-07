import { Box, Button, Sheet, Tab, TabList, TabPanel, Tabs } from '@mui/joy';
import { useMemo, useState } from 'react';
import NotInterestedIcon from '@mui/icons-material/NotInterested';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import { AreYouSureModal } from '../atoms/modals/AreYouSureModal';
import { GeneralTab } from './GeneralTab';
import { Settings } from '../../types/settings/settings';
import { RequestsTab } from './RequestsTab';
import { DataTab } from './DataTab';
import { useAppDispatch } from '../../state/store';
import { setSelectedWorkspace } from '../../state/workspaces/slice';
import { insertSettings } from '../../state/active/slice';
import { useSelector } from 'react-redux';
import { selectSettings } from '../../state/active/selectors';

const style = {
	position: 'absolute' as const,
	top: '50%',
	left: '50%',
	transform: 'translate(-50%, -50%)',
	width: '75vw',
	bgcolor: 'background.grey',
	border: '2px solid #000',
	boxShadow: 24,
	p: 4,
};

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
				<Sheet sx={style}>
					<Tabs aria-label="Settings Tabs" orientation="vertical" sx={{ minWidth: 300, minHeight: 160 }}>
						<TabList>
							<Tab>General</Tab>
							<Tab>Requests</Tab>
							<Tab>Data</Tab>
						</TabList>
						<TabPanel value={0}>
							<GeneralTab settings={unsavedSettings} setSettings={setSettings} />
						</TabPanel>
						<TabPanel value={1}>
							<RequestsTab settings={unsavedSettings} setSettings={setSettings} />
						</TabPanel>
						<TabPanel value={2}>
							<DataTab
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
							{hasChanged ? 'Cancel' : 'Quit'}
						</Button>
					</Box>
				</Sheet>
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
