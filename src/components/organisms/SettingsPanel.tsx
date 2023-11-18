import {
	Box,
	Button,
	Select,
	Sheet,
	Stack,
	Tab,
	TabList,
	TabPanel,
	Tabs,
	Option,
	FormControl,
	FormLabel,
	Input,
} from '@mui/joy';
import { ApplicationDataContext } from '../../managers/GlobalContextManager';
import { useContext, useMemo, useState } from 'react';
import NotInterestedIcon from '@mui/icons-material/NotInterested';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { InputSlider } from '../atoms/input/InputSlider';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import { ApplicationDataManager, applicationDataManager } from '../../managers/ApplicationDataManager';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import invoke from '../../utils/invoke';
import { appLocalDataDir } from '@tauri-apps/api/path';
import { log } from '../../utils/logging';
import DeleteForever from '@mui/icons-material/DeleteForever';

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
					<Tabs aria-label="Settings Tabs" orientation="vertical" sx={{ minWidth: 300, minHeight: 160 }}>
						<TabList>
							<Tab>General</Tab>
							<Tab>Requests</Tab>
							<Tab>Data</Tab>
						</TabList>
						<TabPanel value={0}>
							<Stack spacing={3}>
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
								<FormControl sx={{ width: 240 }}>
									<FormLabel id="select-default-theme-label" htmlFor="select-default-theme-button">
										Theme
									</FormLabel>
									<Select
										value={unsavedSettings.defaultTheme}
										placeholder="Theme"
										onChange={(_e, value) => {
											if (value != null) {
												setUnsavedSettings((currSettings) => {
													return { ...currSettings, defaultTheme: value };
												});
											}
										}}
										slotProps={{
											button: {
												id: 'select-default-theme-button',
												// TODO: Material UI set aria-labelledby correctly & automatically
												// but Base UI and Joy UI don't yet.
												'aria-labelledby': 'select-default-theme-label select-default-theme-button',
											},
										}}
									>
										<Option value="light">Light Mode</Option>
										<Option value="dark">Dark Mode</Option>
										<Option value="system-default">System Default</Option>
									</Select>
								</FormControl>
								<FormControl sx={{ width: 240 }}>
									<FormLabel id="select-default-theme-label" htmlFor="select-default-theme-button">
										Display Variable Names
									</FormLabel>
									<Select
										value={unsavedSettings.displayVariableNames}
										onChange={(_e, value) => {
											if (value != null) {
												setUnsavedSettings((currSettings) => {
													return { ...currSettings, displayVariableNames: value };
												});
											}
										}}
										slotProps={{
											button: {
												id: 'select-display-names-button',
												// TODO: Material UI set aria-labelledby correctly & automatically
												// but Base UI and Joy UI don't yet.
												'aria-labelledby': 'select-display-names-label select-display-names-button',
											},
										}}
									>
										<Option value={true}>Key and Value</Option>
										<Option value={false}>Value Only</Option>
									</Select>
								</FormControl>
							</Stack>
						</TabPanel>
						<TabPanel value={1}>
							<Stack spacing={3}>
								<FormControl sx={{ width: 200 }}>
									<FormLabel id="network-timeout-label" htmlFor="network-timeout-input">
										Network Call Timeout Duration
									</FormLabel>
									<Input
										value={unsavedSettings.timeoutDurationMS / 1000}
										onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
											const value = +e.target.value;
											setUnsavedSettings((currSettings) => {
												return { ...currSettings, timeoutDurationMS: value * 1000 };
											});
										}}
										slotProps={{
											input: {
												id: 'network-timeout-input',
												// TODO: Material UI set aria-labelledby correctly & automatically
												// but Base UI and Joy UI don't yet.
												'aria-labelledby': 'network-timeout-label network-timeout-input',
											},
										}}
										startDecorator={<HourglassBottomIcon />}
										endDecorator={'Seconds'}
									/>
								</FormControl>
							</Stack>
						</TabPanel>
						<TabPanel value={2}>
							<Stack spacing={3}>
								<Button
									sx={{ width: '200px' }}
									startDecorator={<FolderOpenIcon />}
									onClick={async () => {
										const localDir = await appLocalDataDir();
										const data = `${localDir}${ApplicationDataManager.DATA_FOLDER_NAME}`;
										log.info(`data path: ${data}`);
										invoke('show_in_explorer', { path: data });
									}}
								>
									Open Data Folder
								</Button>
								<Button
									sx={{ width: '200px' }}
									startDecorator={<DeleteForever />}
									color="danger"
									onClick={() => {
										Object.keys(data.requests).forEach((requestId) => {
											applicationDataManager.update('request', requestId, { history: [] });
										});
									}}
								>
									Delete All History
								</Button>
							</Stack>
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
