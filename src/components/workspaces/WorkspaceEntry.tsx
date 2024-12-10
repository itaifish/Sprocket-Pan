import { WorkspaceMetadata } from '../../types/application-data/application-data';
import { Button, Card, CardContent, Typography } from '@mui/joy';
import { formatFullDate } from '../../utils/string';
import EditCalendarIcon from '@mui/icons-material/EditCalendar';
import InfoIcon from '@mui/icons-material/Info';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAppDispatch } from '../../state/store';
import { SprocketTooltip } from '../shared/SprocketTooltip';
import { TextAvatar } from '../shared/TextAvatar';
import { loadAndSelectWorkspace } from '../../state/global/thunks';
import { GradientBorderBoundingBox } from '../shared/GradientBorderBoundingBox';

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
				minHeight: 200,
				minWidth: 400,
				'--Card-radius': (theme) => theme.vars.radius.xs,
			}}
		>
			<CardContent orientation="horizontal" sx={{ alignItems: 'center', gap: 1 }}>
				<GradientBorderBoundingBox>
					<TextAvatar
						username={workspace.name}
						size="lg"
						sx={{ p: 0.5, border: '2px solid', borderColor: 'background.body' }}
					/>
				</GradientBorderBoundingBox>
				<Typography level="title-lg">{workspace.name}</Typography>
			</CardContent>
			<CardContent orientation="horizontal">
				<SprocketTooltip text="Last Modified">
					<EditCalendarIcon></EditCalendarIcon>
				</SprocketTooltip>
				<Typography level="body-md"> {formatFullDate(new Date(workspace.lastModified))}</Typography>
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
				<Button variant="outlined" color="danger" startDecorator={<DeleteIcon />} onClick={deleteWorkspace}>
					Delete
				</Button>
				<Button variant="outlined" startDecorator={<OpenInNewIcon />} onClick={openWorkspace}>
					Open
				</Button>
			</CardContent>
		</Card>
	);
}
