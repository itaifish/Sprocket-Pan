import { useEffect, useState } from 'react';
import { WorkspaceMetadataWithPath, fileSystemManager } from '../../managers/FileSystemManager';
import { Box, Button, Card, CardContent, Grid, Typography } from '@mui/joy';
import { TextAvatar } from '../atoms/TextAvatar';
import { formatDate } from '../../utils/string';
import EditCalendarIcon from '@mui/icons-material/EditCalendar';
import { SprocketTooltip } from '../atoms/SprocketTooltip';
import InfoIcon from '@mui/icons-material/Info';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

interface WorkspaceSelectorProps {
	selectWorkspace: (workspace: string | undefined) => void;
}

export function WorkspaceSelector({ selectWorkspace }: WorkspaceSelectorProps) {
	const [workspaces, setWorkspaces] = useState<WorkspaceMetadataWithPath[]>([]);

	useEffect(() => {
		async function saveDirectories() {
			const newWorkspaces = await fileSystemManager.getWorkspaces();
			setWorkspaces(newWorkspaces);
		}
		saveDirectories();
	}, []);

	return (
		<>
			<Typography sx={{ paddingY: '30px', textAlign: 'center' }} level="h1">
				Select a Workspace
			</Typography>
			<Grid container spacing={6} justifyContent="center">
				<Grid xs={4}>
					{workspaces.map((workspace, index) => (
						<Card
							key={index}
							sx={{
								minWidth: 200,
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
								<Typography level="body-sm">{workspace.description}</Typography>
							</CardContent>
							<CardContent orientation="horizontal" sx={{ gap: 1 }}>
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
					))}
				</Grid>
			</Grid>
		</>
	);
}
