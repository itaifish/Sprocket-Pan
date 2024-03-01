import { useEffect, useState } from 'react';
import { WorkspaceMetadataWithPath, fileSystemManager } from '../../managers/FileSystemManager';
import { Box, Button, Card, CardContent, Grid, Link, Typography, useTheme } from '@mui/joy';
import { TextAvatar } from '../atoms/TextAvatar';
import { formatDate } from '../../utils/string';
import EditCalendarIcon from '@mui/icons-material/EditCalendar';
import { SprocketTooltip } from '../atoms/SprocketTooltip';
import InfoIcon from '@mui/icons-material/Info';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { CreateNewWorkspaceModal } from '../atoms/modals/CreateNewWorkspaceModal';
import DeleteIcon from '@mui/icons-material/Delete';
import { AreYouSureModal } from '../atoms/modals/AreYouSureModal';
import { applicationDataManager } from '../../managers/ApplicationDataManager';

interface WorkspaceSelectorProps {
	selectWorkspace: (workspace: string | undefined) => void;
}

export function WorkspaceSelector({ selectWorkspace }: WorkspaceSelectorProps) {
	const [workspaces, setWorkspaces] = useState<WorkspaceMetadataWithPath[]>([]);
	const [createNewModalOpen, setCreateNewModalOpen] = useState(false);
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [workspaceToDelete, setWorkspaceToDelete] = useState('');
	const theme = useTheme();
	async function loadDirectories() {
		const newWorkspaces = await fileSystemManager.getWorkspaces();
		setWorkspaces(newWorkspaces.sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime()));
	}
	useEffect(() => {
		loadDirectories();
		fileSystemManager.on('workspacesChanged', loadDirectories);
		return () => {
			fileSystemManager.removeListener('workspacesChanged', loadDirectories);
		};
	}, []);

	return (
		<>
			<Typography sx={{ paddingY: '30px', textAlign: 'center' }} level="h1">
				Select a Workspace
			</Typography>
			<Grid container spacing={6} columnSpacing={6} justifyContent="center">
				{workspaces.map((workspace, index) => (
					<Grid xs={3.5} key={index}>
						<Card
							sx={{
								'--Card-radius': (theme) => theme.vars.radius.xs,
							}}
						>
							<CardContent orientation="horizontal" sx={{ alignItems: 'center', gap: 1 }}>
								<Box
									sx={{
										position: 'relative',
										'&::before': {
											content: '""',
											position: 'absolute',
											top: 0,
											left: 0,
											bottom: 0,
											right: 0,
											m: '-2px',
											borderRadius: '50%',
											background: 'linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)',
										},
									}}
								>
									<TextAvatar
										username={workspace.name}
										size="lg"
										sx={{ p: 0.5, border: '2px solid', borderColor: 'background.body' }}
									/>
								</Box>
								<Typography level="title-lg">{workspace.name}</Typography>
							</CardContent>
							<CardContent orientation="horizontal">
								<SprocketTooltip text="Last Modified">
									<EditCalendarIcon></EditCalendarIcon>
								</SprocketTooltip>
								<Typography level="body-md"> {formatDate(workspace.lastModified)}</Typography>
							</CardContent>
							<CardContent orientation="horizontal">
								<SprocketTooltip text="Description">
									<InfoIcon></InfoIcon>
								</SprocketTooltip>
								<Typography level="body-sm" sx={{ wordBreak: 'break-all' }}>
									{workspace.description}
								</Typography>
							</CardContent>
							<CardContent orientation="horizontal" sx={{ gap: 1 }}>
								{workspace.path != undefined && (
									<Button
										variant="outlined"
										color="danger"
										startDecorator={<DeleteIcon />}
										onClick={() => {
											setWorkspaceToDelete(workspace.path as string);
											setDeleteModalOpen(true);
										}}
									>
										Delete
									</Button>
								)}
								<Button
									variant="outlined"
									startDecorator={<OpenInNewIcon />}
									onClick={() => {
										selectWorkspace(workspace.path);
									}}
								>
									Open
								</Button>
							</CardContent>
						</Card>
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
				action={`Delete the "${workspaceToDelete}" workspace`}
				open={deleteModalOpen}
				closeFunc={() => setDeleteModalOpen(false)}
				actionFunc={async () => {
					await fileSystemManager.deleteWorkspace(workspaceToDelete);
					// if we're deleting the current data, set to default workspace's data
					if (workspaceToDelete == applicationDataManager.getWorkspace()) {
						applicationDataManager.setWorkspace(undefined);
					}
				}}
			/>
		</>
	);
}
