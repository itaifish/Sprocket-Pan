import { useState } from 'react';
import { Box, Container, Stack, Typography, useTheme } from '@mui/joy';
import { useSelector } from 'react-redux';
import { useFileSystemSynchronization } from '../../hooks/useFileSystemSynchronization';
import { useAppDispatch } from '../../state/store';
import { WorkspaceMetadata } from '../../types/application-data/application-data';
import { AreYouSureModal } from '../shared/modals/AreYouSureModal';
import { CreateNewWorkspaceModal } from './CreateNewWorkspaceModal';
import { WorkspaceEntry } from './WorkspaceEntry';
import { selectWorkspacesList } from '../../state/global/selectors';
import { deleteWorkspace } from '../../state/global/thunks';
import { NewWorkspaceCard } from './NewWorkspaceCard';
import { OpenSettingsButton } from '../shared/buttons/OpenSettingsButton';
import { GlobalSettingsPanel } from '../settings/GlobalSettingsPanel';

export function WorkspaceSelector() {
	useFileSystemSynchronization();
	const workspaces = useSelector(selectWorkspacesList);
	const [createNewModalOpen, setCreateNewModalOpen] = useState(false);
	const [workspaceToDelete, setWorkspaceToDelete] = useState<WorkspaceMetadata | null>(null);
	const dispatch = useAppDispatch();

	function onConfirmDelete() {
		if (workspaceToDelete != null) dispatch(deleteWorkspace(workspaceToDelete));
	}

	const theme = useTheme();

	return (
		<>
			<Box mb="30px" sx={{ backgroundColor: theme.palette.background.surface }} p={2}>
				<Box sx={{ position: 'absolute', top: 20, left: 15 }}>
					<OpenSettingsButton Content={GlobalSettingsPanel} />
				</Box>
				<Typography sx={{ textAlign: 'center' }} level="h2">
					Select a Workspace
				</Typography>
			</Box>
			<Container maxWidth="xl" sx={{ pb: 4 }}>
				<Stack direction="row" flexWrap="wrap" gap={4} justifyContent="center" width="100%" alignItems="stretch">
					{workspaces.map((workspace) => (
						<WorkspaceEntry key={workspace.fileName} workspace={workspace} onDelete={setWorkspaceToDelete} />
					))}
					<NewWorkspaceCard onCreate={() => setCreateNewModalOpen(true)} />
				</Stack>
			</Container>
			<CreateNewWorkspaceModal open={createNewModalOpen} closeFunc={() => setCreateNewModalOpen(false)} />
			<AreYouSureModal
				action={`Delete the "${workspaceToDelete?.name}" workspace`}
				open={workspaceToDelete != null}
				closeFunc={() => setWorkspaceToDelete(null)}
				actionFunc={onConfirmDelete}
			/>
		</>
	);
}
