import { Box, Button, Sheet, Tab, TabList, TabPanel, Tabs } from '@mui/joy';
import { ApplicationDataContext } from '../../managers/GlobalContextManager';
import { useContext, useMemo, useState } from 'react';
import NotInterestedIcon from '@mui/icons-material/NotInterested';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { InputSlider } from '../atoms/input/InputSlider';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import { applicationDataManager } from '../../managers/ApplicationDataManager';

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
	const data = useContext(ApplicationDataContext);
	const [unsavedSettings, setUnsavedSettings] = useState(data.settings);
	const hasChanged = useMemo(() => {
		return JSON.stringify(data.settings) !== JSON.stringify(unsavedSettings);
	}, [data.settings, unsavedSettings]);
	return (
		<>
			<Box>
				<Sheet sx={style}>
					<Tabs aria-label="Settings Tabs" orientation="vertical" sx={{ minWidth: 300, height: 160 }}>
						<TabList>
							<Tab>General</Tab>
							<Tab>Requests</Tab>
						</TabList>
						<TabPanel value={0}>
							<InputSlider
								value={unsavedSettings.zoomLevel}
								label="Zoom"
								setValue={(val) =>
									setUnsavedSettings((currSettings) => {
										return { ...currSettings, zoomLevel: val };
									})
								}
								endDecorator="%"
								icon={<ZoomInIcon />}
								range={{ min: 20, max: 300 }}
							/>
						</TabPanel>
						<TabPanel value={1}>
							<b>Second</b> tab panel
						</TabPanel>
					</Tabs>
					<Box
						sx={{
							display: 'flex',
							flexDirection: 'row-reverse',
						}}
					>
						<Button
							startDecorator={<ThumbUpAltIcon />}
							disabled={!hasChanged}
							onClick={() => applicationDataManager.setSettings(unsavedSettings)}
						>
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
		</>
	);
};
