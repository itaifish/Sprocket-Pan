import { Box, Button, Grid } from '@mui/joy';
import { useState } from 'react';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import { appLocalDataDir } from '@tauri-apps/api/path';
import DeleteForever from '@mui/icons-material/DeleteForever';
import SaveIcon from '@mui/icons-material/Save';
import { invoke } from '@tauri-apps/api';
import { ApplicationDataManager } from '../../../managers/ApplicationDataManager';
import { deleteAllHistory } from '../../../state/active/slice';
import { saveActiveData } from '../../../state/active/thunks/environments';
import { useAppDispatch } from '../../../state/store';
import { AreYouSureModal } from '../../shared/modals/AreYouSureModal';

interface DataTabProps {
	onQuit: () => void;
	goToWorkspaceSelection: () => void;
}

export function DataTab({ onQuit, goToWorkspaceSelection }: DataTabProps) {
	const dispatch = useAppDispatch();
	const [deleteHistoryModalOpen, setDeleteHistoryModalOpen] = useState(false);

	function save() {
		dispatch(saveActiveData());
	}

	function deleteHistory() {
		dispatch(deleteAllHistory());
	}

	return (
		<Box sx={{ width: '500px' }}>
			<Grid container justifyContent={'left'} spacing={4}>
				<Grid xs={6}>
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
				<Grid xs={6}>
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
				<Grid xs={6}>
					<Button
						sx={{ width: '200px' }}
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
						sx={{ width: '200px' }}
						startDecorator={<SaveIcon />}
						color="danger"
						variant="outlined"
						onClick={onQuit}
					>
						Leave Without Saving & Select Another Workspace
					</Button>
				</Grid>
			</Grid>
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
