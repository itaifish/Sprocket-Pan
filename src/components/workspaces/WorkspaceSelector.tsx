import { useState } from 'react';
import { Container, Stack, Typography } from '@mui/joy';
import { useSelector } from 'react-redux';
import { useWorkspaceFileSystemSynchronization } from '../../hooks/useWorkspaceFileSystemSynchronization';
import { useAppDispatch } from '../../state/store';
import { WorkspaceMetadata } from '../../types/application-data/application-data';
import { AreYouSureModal } from '../shared/modals/AreYouSureModal';
import { CreateNewWorkspaceModal } from './CreateNewWorkspaceModal';
import { WorkspaceEntry } from './WorkspaceEntry';
import { selectWorkspacesList } from '../../state/global/selectors';
import { deleteWorkspace } from '../../state/global/thunks';
import { NewWorkspaceCard } from './NewWorkspaceCard';

export function WorkspaceSelector() {
	useWorkspaceFileSystemSynchronization();
	const workspaces = useSelector(selectWorkspacesList);
	const [createNewModalOpen, setCreateNewModalOpen] = useState(false);
	const [workspaceToDelete, setWorkspaceToDelete] = useState<WorkspaceMetadata | null>(null);
	const dispatch = useAppDispatch();

	function onConfirmDelete() {
		if (workspaceToDelete != null) dispatch(deleteWorkspace(workspaceToDelete));
	}

	return (
		<>
			<Typography sx={{ paddingY: '30px', textAlign: 'center' }} level="h1">
				Select a Workspace
			</Typography>
			<Container maxWidth="xl">
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
