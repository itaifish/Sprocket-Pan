import { useState } from 'react';
import { Box, Card, CardContent, Grid, Link, Typography, useTheme } from '@mui/joy';
import { useSelector } from 'react-redux';
import { useWorkspaceFileSystemSynchronization } from '../../hooks/useWorkspaceFileSystemSynchronization';
import { useAppDispatch } from '../../state/store';
import { WorkspaceMetadata } from '../../types/application-data/application-data';
import { AreYouSureModal } from '../shared/modals/AreYouSureModal';
import { CreateNewWorkspaceModal } from './CreateNewWorkspaceModal';
import { WorkspaceEntry } from './WorkspaceEntry';
import { selectWorkspacesList } from '../../state/global/selectors';
import { deleteWorkspace } from '../../state/global/thunks';

export function WorkspaceSelector() {
	useWorkspaceFileSystemSynchronization();

	const workspaces = useSelector(selectWorkspacesList);
	const [createNewModalOpen, setCreateNewModalOpen] = useState(false);
	const [workspaceToDelete, setWorkspaceToDelete] = useState<WorkspaceMetadata | null>(null);
	const theme = useTheme();
	const dispatch = useAppDispatch();

	function onConfirmDelete() {
		if (workspaceToDelete != null) dispatch(deleteWorkspace(workspaceToDelete));
	}

	return (
		<>
			<Typography sx={{ paddingY: '30px', textAlign: 'center' }} level="h1">
				Select a Workspace
			</Typography>
			<Grid container spacing={6} columnSpacing={6} justifyContent="center">
				{workspaces.map((workspace, index) => (
					<Grid xs={3.5} key={index}>
						<WorkspaceEntry workspace={workspace} onDelete={setWorkspaceToDelete} />
					</Grid>
				))}
				<Grid xs={4}>
					<Card
						sx={{
							minHeight: 200,
							'--Card-radius': (theme) => theme.vars.radius.xs,
							'&:hover': {
								cursor: 'pointer',
								backgroundColor: `${theme.palette.background.level1}`,
							},
						}}
					>
						<CardContent>
							<Link
								overlay
								underline="none"
								href="#interactive-card"
								onClick={() => {
									setCreateNewModalOpen(true);
								}}
							></Link>
							<Box sx={{ display: 'block', mx: 'auto' }}>
								<Box
									sx={{
										borderRadius: '50%',
										width: '150px',
										height: '150px',
										backgroundColor: `rgba(${theme.palette.primary.darkChannel})`,
									}}
								>
									<Box
										sx={{
											position: 'relative',
											backgroundColor: '#FFFFFF',
											width: '50%',
											height: '12.5%',
											left: '25%',
											top: '43.75%',
										}}
									></Box>
									<Box
										sx={{
											position: 'relative',
											backgroundColor: '#FFFFFF',
											height: '50%',
											width: '12.5%',
											top: '12.5%',
											left: '43.75%',
										}}
									>
										{' '}
										<Link
											overlay
											underline="none"
											href="#interactive-card"
											onClick={() => {
												setCreateNewModalOpen(true);
											}}
										></Link>
									</Box>
								</Box>
							</Box>
						</CardContent>
					</Card>
				</Grid>
			</Grid>
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
