import { WorkspaceMetadata } from '../../types/application-data/application-data';
import { Button, Card, Stack, Typography } from '@mui/joy';
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
import { EllipsisTypography } from '../shared/EllipsisTypography';

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
				overflow: 'hidden',
				height: 200,
				width: 400,
				'--Card-radius': (theme) => theme.vars.radius.xs,
			}}
		>
			<Stack gap={2}>
				<Stack direction="row" gap={2} alignItems="center">
					<GradientBorderBoundingBox>
						<TextAvatar
							username={workspace.name}
							size="md"
							sx={{ p: 0.5, border: '2px solid', borderColor: 'background.body' }}
						/>
					</GradientBorderBoundingBox>
					<EllipsisTypography level="title-lg">{workspace.name}</EllipsisTypography>
				</Stack>
				<Stack gap={1} ml={1}>
					<Stack direction="row" gap={1} alignItems="center">
						<SprocketTooltip text="Last Modified">
							<EditCalendarIcon />
						</SprocketTooltip>
						<Typography level="body-md"> {formatFullDate(new Date(workspace.lastModified))}</Typography>
					</Stack>
					<Stack direction="row" gap={1} alignItems="center">
						<SprocketTooltip text="Description">
							<InfoIcon />
						</SprocketTooltip>
						<EllipsisTypography level="body-sm">{workspace.description}</EllipsisTypography>
					</Stack>
				</Stack>
				<Stack justifyContent="space-between" direction="row" gap={6} ml="-2px">
					<Button variant="plain" color="danger" startDecorator={<DeleteIcon />} onClick={deleteWorkspace}>
						Delete
					</Button>
					<Button sx={{ width: '100%' }} variant="outlined" startDecorator={<OpenInNewIcon />} onClick={openWorkspace}>
						Open
					</Button>
				</Stack>
			</Stack>
		</Card>
	);
}
