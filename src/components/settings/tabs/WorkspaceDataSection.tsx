import { Button, Stack, Typography } from '@mui/joy';
import { useState } from 'react';
import DeleteForever from '@mui/icons-material/DeleteForever';
import SaveIcon from '@mui/icons-material/Save';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import { useSelector } from 'react-redux';
import { AreYouSureModal } from '@/components/shared/modals/AreYouSureModal';
import { WorkspaceDataManager } from '@/managers/data/WorkspaceDataManager';
import { selectActiveState } from '@/state/active/selectors';
import { activeActions } from '@/state/active/slice';
import { saveActiveData } from '@/state/active/thunks/data';
import { useAppDispatch } from '@/state/store';

export interface WorkspaceDataSectionProps {
	goToWorkspaceSelection: () => void;
}

export function WorkspaceDataSection({ goToWorkspaceSelection }: WorkspaceDataSectionProps) {
	const dispatch = useAppDispatch();
	const [deleteHistoryModalOpen, setDeleteHistoryModalOpen] = useState(false);
	const [isQuitModalOpen, setIsQuitModalOpen] = useState(false);
	const state = useSelector(selectActiveState);
	function save() {
		dispatch(saveActiveData());
	}

	function deleteHistory() {
		dispatch(activeActions.deleteAllHistory());
	}
	const exportData = () => WorkspaceDataManager.exportData(state);
	return (
		<>
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
					onClick={() => setIsQuitModalOpen(true)}
				>
					Exit to Workspace Selection Without Saving
				</Button>
				<Button
					sx={{ width: '250px' }}
					startDecorator={<SaveIcon />}
					color="success"
					variant="outlined"
					onClick={() => {
						save();
						goToWorkspaceSelection();
					}}
				>
					Save & Exit to Workspace Selection
				</Button>
			</Stack>
			<AreYouSureModal
				open={isQuitModalOpen}
				closeFunc={() => setIsQuitModalOpen(false)}
				action="Quit Without Saving"
				actionFunc={goToWorkspaceSelection}
			/>
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
