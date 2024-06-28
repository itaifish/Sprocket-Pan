import { WorkspaceMetadata } from '../../types/application-data/application-data';
import { Box, Button, Card, CardContent, Typography } from '@mui/joy';
import { TextAvatar } from '../atoms/TextAvatar';
import { SprocketTooltip } from '../atoms/SprocketTooltip';
import { formatDate } from '../../utils/string';
import EditCalendarIcon from '@mui/icons-material/EditCalendar';
import InfoIcon from '@mui/icons-material/Info';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAppDispatch } from '../../state/store';
import { loadAndSelectWorkspace } from '../../state/workspaces/thunks';

interface WorkspaceEntryProps {
	workspace: WorkspaceMetadata;
	onDelete: (workspace: WorkspaceMetadata) => void;
}

export function WorkspaceEntry({ workspace, onDelete }: WorkspaceEntryProps) {
	const dispatch = useAppDispatch();
	function deleteWorkspace() {
		onDelete(workspace);
	}
	function openWorkspace() {
		dispatch(loadAndSelectWorkspace(workspace));
	}
	return (
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
				<Typography level="body-md"> {formatDate(new Date(workspace.lastModified))}</Typography>
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
				{workspace.fileName != undefined && (
					<Button variant="outlined" color="danger" startDecorator={<DeleteIcon />} onClick={deleteWorkspace}>
						Delete
					</Button>
				)}
				<Button variant="outlined" startDecorator={<OpenInNewIcon />} onClick={openWorkspace}>
					Open
				</Button>
			</CardContent>
		</Card>
	);
}
