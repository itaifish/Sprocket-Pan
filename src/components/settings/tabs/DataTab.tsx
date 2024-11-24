import {
	Box,
	Button,
	Divider,
	FormControl,
	FormHelperText,
	FormLabel,
	Grid,
	Input,
	Stack,
	Switch,
	Typography,
} from '@mui/joy';
import { useState } from 'react';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import { appLocalDataDir, appLogDir } from '@tauri-apps/api/path';
import DeleteForever from '@mui/icons-material/DeleteForever';
import SaveIcon from '@mui/icons-material/Save';
import { invoke } from '@tauri-apps/api';
import { WorkspaceDataManager } from '../../../managers/WorkspaceDataManager';
import { deleteAllHistory } from '../../../state/active/slice';
import { useAppDispatch } from '../../../state/store';
import { AreYouSureModal } from '../../shared/modals/AreYouSureModal';
import { log } from '../../../utils/logging';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import { save as saveFile } from '@tauri-apps/api/dialog';
import { selectActiveWorkspace } from '../../../state/workspaces/selectors';
import { useSelector } from 'react-redux';
import { saveActiveData } from '../../../state/active/thunks/applicationData';
import { selectAllItems } from '../../../state/active/selectors';
import { writeTextFile } from '@tauri-apps/api/fs';
import {
	noHistoryAndMetadataReplacer,
	noEnvironmentsReplacer,
	combineReplacers,
	noSettingsReplacer,
} from '../../../utils/functions';
import { Settings } from '../../../types/settings/settings';
import TimerIcon from '@mui/icons-material/Timer';

interface DataTabProps {
	onQuit: () => void;
	goToWorkspaceSelection: () => void;
	settings: Settings;
	setSettings: (settings: Partial<Settings>) => void;
}

export function DataTab({ onQuit, goToWorkspaceSelection, setSettings, settings }: DataTabProps) {
	const dispatch = useAppDispatch();
	const [deleteHistoryModalOpen, setDeleteHistoryModalOpen] = useState(false);
	const activeWorkspace = useSelector(selectActiveWorkspace);
	const state = useSelector(selectAllItems);
	function save() {
		dispatch(saveActiveData());
	}

	function deleteHistory() {
		dispatch(deleteAllHistory());
	}
	const exportData = async (exportEnvironments: boolean) => {
		const filePath = await saveFile({
			title: `Save ${activeWorkspace?.name} Workspace`,
			filters: [
				{ name: 'Sprocketpan Workspace', extensions: ['json'] },
				{ name: 'All Files', extensions: ['*'] },
			],
		});

		if (!filePath) {
			return;
		}
		const dataToWrite = JSON.stringify(
			state,
			exportEnvironments
				? combineReplacers([noHistoryAndMetadataReplacer, noSettingsReplacer])
				: combineReplacers([noEnvironmentsReplacer, noHistoryAndMetadataReplacer, noSettingsReplacer]),
		);

		await writeTextFile(filePath, dataToWrite);
	};

	return (
		<Box sx={{ maxWidth: '700px' }}>
			<Stack spacing={2}>
				<Box>
					<Typography>Saving</Typography>
					<Divider />
					<Grid container justifyContent={'left'} spacing={4} sx={{ mt: '10px' }}>
						<Grid xs={6}>
							<FormControl orientation="horizontal" sx={{ width: 300, justifyContent: 'space-between' }}>
								<div>
									<FormLabel>Autosave</FormLabel>
									<FormHelperText sx={{ mt: 0 }}>
										Sprocket Pan will automatically save at a recurring interval
									</FormHelperText>
								</div>
								<Switch
									checked={settings.autoSaveIntervalMS != undefined}
									onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
										setSettings({ autoSaveIntervalMS: event.target.checked ? 60_000 * 5 : undefined })
									}
									color={settings.autoSaveIntervalMS != undefined ? 'success' : 'neutral'}
									variant={settings.autoSaveIntervalMS != undefined ? 'solid' : 'outlined'}
									endDecorator={settings.autoSaveIntervalMS != undefined ? 'Enabled' : 'Disabled'}
									slotProps={{
										endDecorator: {
											sx: {
												minWidth: 24,
											},
										},
									}}
								/>
							</FormControl>
						</Grid>
						{settings.autoSaveIntervalMS != undefined && (
							<Grid xs={4}>
								<FormControl sx={{ width: 300 }}>
									<FormLabel id="autosave-duration-label" htmlFor="autosave-duration-input">
										Autosave Interval Duration
									</FormLabel>
									<Input
										sx={{ width: 300 }}
										value={(settings.autoSaveIntervalMS ?? 0) / 60_000}
										onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
											const value = +e.target.value;
											if (!isNaN(value) && value > 0) {
												setSettings({ autoSaveIntervalMS: value * 60_000 });
											}
										}}
										slotProps={{
											input: {
												id: 'autosave-duration-input',
												// TODO: Material UI set aria-labelledby correctly & automatically
												// but Base UI and Joy UI don't yet.
												'aria-labelledby': 'autosave-duration-label autosave-duration-input',
											},
										}}
										startDecorator={<TimerIcon />}
										endDecorator={'Minutes'}
									/>
								</FormControl>
							</Grid>
						)}
					</Grid>
				</Box>
				<Box>
					<Typography>Data</Typography>
					<Grid container justifyContent={'left'} spacing={4}>
						<Grid xs={4}>
							<Button
								sx={{ width: '200px' }}
								startDecorator={<FolderOpenIcon />}
								onClick={async () => {
									const localDir = await appLocalDataDir();
									const data = `${localDir}${WorkspaceDataManager.DATA_FOLDER_NAME}`;
									invoke('show_in_explorer', { path: data });
								}}
								variant="outlined"
							>
								Open Data Folder
							</Button>
						</Grid>
						<Grid xs={4}>
							<Button
								sx={{ width: '200px' }}
								startDecorator={<FolderOpenIcon />}
								onClick={async () => {
									const logDir = await appLogDir();
									const data = `${logDir}${log.LOG_FILE_NAME}`;
									invoke('show_in_explorer', { path: data });
								}}
								variant="outlined"
							>
								Open Logs Folder
							</Button>
						</Grid>
						<Grid xs={4}>
							<Button
								sx={{ width: '200px' }}
								startDecorator={<DeleteForever />}
								color="danger"
								onClick={() => setDeleteHistoryModalOpen(true)}
								variant="outlined"
							>
								Delete All History
							</Button>
						</Grid>
					</Grid>
				</Box>
				<Box>
					<Typography>Workspace</Typography>
					<Grid container justifyContent={'left'} spacing={4}>
						<Grid xs={6}>
							<Button
								sx={{ width: '300px' }}
								startDecorator={<SaveIcon />}
								color="success"
								variant="outlined"
								onClick={async () => {
									save();
									goToWorkspaceSelection();
								}}
							>
								Save & Select Another Workspace
							</Button>
						</Grid>
						<Grid xs={6}>
							<Button
								sx={{ width: '300px' }}
								startDecorator={<SaveIcon />}
								color="danger"
								variant="outlined"
								onClick={onQuit}
							>
								Leave Without Saving & Select Another Workspace
							</Button>
						</Grid>
					</Grid>
				</Box>
				<Box>
					<Typography>Export</Typography>
					<Grid container justifyContent={'left'} spacing={4}>
						<Grid xs={6}>
							<Button
								sx={{ width: '300px' }}
								startDecorator={<FileUploadIcon />}
								color="primary"
								variant="outlined"
								onClick={async () => {
									exportData(true);
								}}
							>
								Export With Environment Variables
							</Button>
						</Grid>
						<Grid xs={6}>
							<Button
								sx={{ width: '300px' }}
								startDecorator={<FileUploadIcon />}
								color="primary"
								variant="outlined"
								onClick={async () => {
									exportData(false);
								}}
							>
								Export Without Environment Variables
							</Button>
						</Grid>
					</Grid>
				</Box>
			</Stack>
			<AreYouSureModal
				open={deleteHistoryModalOpen}
				closeFunc={function (): void {
					setDeleteHistoryModalOpen(false);
				}}
				action={'Delete All History'}
				actionFunc={deleteHistory}
			/>
		</Box>
	);
}
