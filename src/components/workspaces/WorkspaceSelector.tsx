import { useState } from 'react';
import { Box, Container, Stack, Typography, useTheme } from '@mui/joy';
import { useSelector } from 'react-redux';
import { useFileSystemSynchronization } from '@/hooks/useFileSystemSynchronization';
import { selectWorkspacesList } from '@/state/global/selectors';
import { useAppDispatch } from '@/state/store';
import { GlobalSettingsPanel } from '../settings/GlobalSettingsPanel';
import { OpenSettingsButton } from '../shared/buttons/OpenSettingsButton';
import { CreateNewWorkspaceModal } from './CreateNewWorkspaceModal';
import { NewWorkspaceCard } from './NewWorkspaceCard';
import { WorkspaceEntry } from './WorkspaceEntry';
import { uiActions } from '@/state/ui/slice';

export function WorkspaceSelector() {
	useFileSystemSynchronization();
	const workspaces = useSelector(selectWorkspacesList);
	const [createNewModalOpen, setCreateNewModalOpen] = useState(false);
	const dispatch = useAppDispatch();
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
						<WorkspaceEntry
							key={workspace.fileName}
							workspace={workspace}
							onDelete={() => dispatch(uiActions.addToDeleteQueue(workspace.id))}
						/>
					))}
					<NewWorkspaceCard onCreate={() => setCreateNewModalOpen(true)} />
				</Stack>
			</Container>
			<CreateNewWorkspaceModal open={createNewModalOpen} closeFunc={() => setCreateNewModalOpen(false)} />
		</>
	);
}
