import { Box, Button, Grid, Stack, Typography } from '@mui/joy';
import { useState } from 'react';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import { appLocalDataDir, appLogDir } from '@tauri-apps/api/path';
import DeleteForever from '@mui/icons-material/DeleteForever';
import SaveIcon from '@mui/icons-material/Save';
import { invoke } from '@tauri-apps/api';
import { ApplicationDataManager } from '../../../managers/ApplicationDataManager';
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

interface DataTabProps {
	onQuit: () => void;
	goToWorkspaceSelection: () => void;
}

export function DataTab({ onQuit, goToWorkspaceSelection }: DataTabProps) {
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
					<Typography>Data</Typography>
					<Grid container justifyContent={'left'} spacing={4}>
						<Grid xs={4}>
							<Button
								sx={{ width: '200px' }}
								startDecorator={<FolderOpenIcon />}
								onClick={async () => {
									const localDir = await appLocalDataDir();
									const data = `${localDir}${ApplicationDataManager.DATA_FOLDER_NAME}`;
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
