import { Box, Button, FormControl, FormLabel, Input, Stack, Switch, Typography } from '@mui/joy';
import { useState } from 'react';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import { appLocalDataDir, appLogDir } from '@tauri-apps/api/path';
import DeleteForever from '@mui/icons-material/DeleteForever';
import SaveIcon from '@mui/icons-material/Save';
import { invoke } from '@tauri-apps/api';
import { deleteAllHistory } from '../../../state/active/slice';
import { useAppDispatch } from '../../../state/store';
import { AreYouSureModal } from '../../shared/modals/AreYouSureModal';
import { log } from '../../../utils/logging';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import { useSelector } from 'react-redux';
import { saveActiveData } from '../../../state/active/thunks/applicationData';
import { selectActiveState } from '../../../state/active/selectors';
import { Settings } from '../../../types/settings/settings';
import TimerIcon from '@mui/icons-material/Timer';
import { FileSystemWorker } from '../../../managers/file-system/FileSystemWorker';
import { WorkspaceDataManager } from '../../../managers/data/WorkspaceDataManager';
import { MS_IN_MINUTE } from '../../../constants/constants';

interface DataTabProps {
	onQuit: () => void;
	goToWorkspaceSelection: () => void;
	settings: Settings;
	setSettings: (settings: Partial<Settings>) => void;
}

export function DataTab({ onQuit, goToWorkspaceSelection, setSettings, settings }: DataTabProps) {
	const dispatch = useAppDispatch();
	const [deleteHistoryModalOpen, setDeleteHistoryModalOpen] = useState(false);
	const state = useSelector(selectActiveState);
	function save() {
		dispatch(saveActiveData());
	}

	function deleteHistory() {
		dispatch(deleteAllHistory());
	}
	const exportData = () => WorkspaceDataManager.exportData(state);

	const autoSaveOn = settings.autoSaveIntervalMS != null;

	return (
		<>
			<Stack spacing={2}>
				<Typography>Saving</Typography>
				<Stack direction="row" gap={2}>
					<FormControl sx={{ width: 250 }}>
						<FormLabel>Autosave</FormLabel>
						<Box>
							<Switch
								checked={autoSaveOn}
								onChange={(event) =>
									setSettings({ autoSaveIntervalMS: event.target.checked ? MS_IN_MINUTE * 5 : undefined })
								}
								color={autoSaveOn ? 'success' : 'neutral'}
								variant={autoSaveOn ? 'solid' : 'outlined'}
								endDecorator={autoSaveOn ? 'Enabled' : 'Disabled'}
							/>
						</Box>
					</FormControl>

					<FormControl sx={{ width: 250 }}>
						<FormLabel id="autosave-duration-label" htmlFor="autosave-duration-input">
							Interval
						</FormLabel>
						<Input
							disabled={!autoSaveOn}
							sx={{ width: 250 }}
							value={(settings.autoSaveIntervalMS ?? 0) / MS_IN_MINUTE}
							onChange={(e) => {
								const value = +e.target.value;
								if (!isNaN(value) && value > 0) {
									setSettings({ autoSaveIntervalMS: value * MS_IN_MINUTE });
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
				</Stack>

				<Typography>Data</Typography>
				<Stack direction="row" gap={2}>
					<Button
						sx={{ width: '250px' }}
						startDecorator={<FolderOpenIcon />}
						onClick={async () => {
							const localDir = await appLocalDataDir();
							const data = `${localDir}${FileSystemWorker.DATA_FOLDER_NAME}`;
							invoke('show_in_explorer', { path: data });
						}}
						variant="outlined"
					>
						Open Data Folder
					</Button>

					<Button
						sx={{ width: '250px' }}
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
				</Stack>

				<Typography>History</Typography>
				<Button
					sx={{ width: '250px' }}
					startDecorator={<DeleteForever />}
					color="danger"
					onClick={() => setDeleteHistoryModalOpen(true)}
					variant="outlined"
				>
					Delete All History
				</Button>

				<Typography>Workspace</Typography>

				<Button
					sx={{ width: '250px' }}
					startDecorator={<FileUploadIcon />}
					color="primary"
					variant="outlined"
					onClick={exportData}
				>
					Export Workspace
				</Button>

				<Stack direction="row" gap={2}>
					<Button
						sx={{ width: '250px' }}
						startDecorator={<SaveIcon />}
						color="danger"
						variant="outlined"
						onClick={onQuit}
					>
						Exit to Workspace Selection Without Saving
					</Button>
					<Button
						sx={{ width: '250px' }}
						startDecorator={<SaveIcon />}
						color="success"
						variant="outlined"
						onClick={async () => {
							save();
							goToWorkspaceSelection();
						}}
					>
						Save & Exit to Workspace Selection
					</Button>
				</Stack>
			</Stack>
			<AreYouSureModal
				open={deleteHistoryModalOpen}
				closeFunc={function (): void {
					setDeleteHistoryModalOpen(false);
				}}
				action={'Delete All History'}
				actionFunc={deleteHistory}
			/>
		</>
	);
}
