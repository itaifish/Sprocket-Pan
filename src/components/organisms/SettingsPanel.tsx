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
	FormHelperText,
	IconButton,
	Chip,
	Typography,
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
import { AreYouSureModal } from '../atoms/modals/AreYouSureModal';
import ManageHistoryIcon from '@mui/icons-material/ManageHistory';
import WestIcon from '@mui/icons-material/West';
import EastIcon from '@mui/icons-material/East';
import { iconFromTabType } from '../molecules/tabs/TabHeader';
import { Settings } from '../../types/settings/settings';
import { useAutoAnimate } from '@formkit/auto-animate/react';

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

const ScriptChips = ({
	preOrPost,
	unsavedSettings,
	setUnsavedSettings,
}: {
	preOrPost: 'pre' | 'post';
	unsavedSettings: Settings;
	setUnsavedSettings: React.Dispatch<React.SetStateAction<Settings>>;
}) => {
	const [parent] = useAutoAnimate();
	return (
		<span ref={parent}>
			{unsavedSettings.scriptRunnerStrategy[preOrPost].map((strategyItem, index) => (
				<span key={`${preOrPost}${index}`}>
					{index !== 0 && (
						<IconButton
							sx={{ verticalAlign: 'middle' }}
							size="sm"
							onClick={() => {
								const copy = structuredClone(unsavedSettings.scriptRunnerStrategy[preOrPost]);
								const temp = copy[index];
								copy[index] = copy[index - 1];
								copy[index - 1] = temp;
								setUnsavedSettings((currSettings) => ({
									...currSettings,
									scriptRunnerStrategy: { ...currSettings.scriptRunnerStrategy, [preOrPost]: copy },
								}));
							}}
						>
							<WestIcon />
						</IconButton>
					)}
					<Chip sx={{ verticalAlign: 'middle' }} startDecorator={iconFromTabType[strategyItem]}>
						{preOrPost}-{strategyItem}
					</Chip>
					{index !== 2 && (
						<IconButton
							size="sm"
							sx={{ verticalAlign: 'middle' }}
							onClick={() => {
								const copy = structuredClone(unsavedSettings.scriptRunnerStrategy[preOrPost]);
								const temp = copy[index];
								copy[index] = copy[index + 1];
								copy[index + 1] = temp;
								setUnsavedSettings((currSettings) => ({
									...currSettings,
									scriptRunnerStrategy: { ...currSettings.scriptRunnerStrategy, [preOrPost]: copy },
								}));
							}}
						>
							<EastIcon />
						</IconButton>
					)}
				</span>
			))}
		</span>
	);
};

export const SettingsPanel = (props: SettingsPanelProps) => {
	const data = useContext(ApplicationDataContext);
	const [unsavedSettings, setUnsavedSettings] = useState(data.settings);
	const [deleteHistoryModalOpen, setDeleteHistoryModalOpen] = useState(false);
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
								<FormControl sx={{ width: 300 }}>
									<FormLabel id="network-timeout-label" htmlFor="network-timeout-input">
										Network Call Timeout Duration
									</FormLabel>
									<Input
										sx={{ width: 200 }}
										value={unsavedSettings.timeoutDurationMS / 1000}
										onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
											const value = +e.target.value;
											if (!isNaN(value)) {
												setUnsavedSettings((currSettings) => {
													return { ...currSettings, timeoutDurationMS: value * 1000 };
												});
											}
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
								<FormControl sx={{ width: 300 }}>
									<FormLabel id="maximum-history-label" htmlFor="maximum-history-input">
										Maximum Number of History Records
									</FormLabel>
									<Input
										sx={{ width: 200 }}
										value={unsavedSettings.maxHistoryLength}
										onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
											const value = +e.target.value;
											if (!isNaN(value)) {
												setUnsavedSettings((currSettings) => {
													return { ...currSettings, maxHistoryLength: value };
												});
											}
										}}
										slotProps={{
											input: {
												id: 'maximum-history-input',
												// TODO: Material UI set aria-labelledby correctly & automatically
												// but Base UI and Joy UI don't yet.
												'aria-labelledby': 'maximum-history-label maximum-history-input',
											},
										}}
										startDecorator={<ManageHistoryIcon />}
										endDecorator={'Records'}
									/>
									<FormHelperText>Set this value as -1 for no maximum</FormHelperText>
								</FormControl>
								<Box>
									<Typography>Script Strategy Order</Typography>
									<Sheet variant="outlined" color="neutral" sx={{ padding: 4 }}>
										<ScriptChips
											preOrPost="pre"
											setUnsavedSettings={setUnsavedSettings}
											unsavedSettings={unsavedSettings}
										/>
										<Chip sx={{ verticalAlign: 'middle' }} color="primary" startDecorator={iconFromTabType['request']}>
											Request
										</Chip>
										<ScriptChips
											preOrPost="post"
											setUnsavedSettings={setUnsavedSettings}
											unsavedSettings={unsavedSettings}
										/>
									</Sheet>
								</Box>
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
									onClick={() => setDeleteHistoryModalOpen(true)}
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
			<AreYouSureModal
				open={deleteHistoryModalOpen}
				closeFunc={function (): void {
					setDeleteHistoryModalOpen(false);
				}}
				action={'Delete All History'}
				actionFunc={() => {
					Object.keys(data.requests).forEach((requestId) => {
						applicationDataManager.update('request', requestId, { history: [] });
					});
				}}
			/>
		</>
	);
};
