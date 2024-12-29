import { Card, Chip, IconButton, Stack, Typography } from '@mui/joy';
import { WorkspaceFileCardContent, WorkspaceFileCardProps } from './WorkspaceFileCard';
import { Folder, OpenInNew } from '@mui/icons-material';
import { SprocketTooltip } from '@/components/shared/SprocketTooltip';

export function ActiveWorkspaceFileCard({ workspace }: WorkspaceFileCardProps) {
	const onEditButtonClick = () => {};

	return (
		<Card variant="soft">
			<Stack gap={0} alignItems="center" position="absolute" top="-10px" right="-5px">
				<Chip color="success">Active</Chip>
				<SprocketTooltip text="Open Workspace Tab">
					<IconButton onClick={onEditButtonClick}>
						<OpenInNew />
					</IconButton>
				</SprocketTooltip>
			</Stack>
			<WorkspaceFileCardContent workspace={workspace} />
			<SprocketTooltip text="File Name">
				<Chip sx={{ ml: '-6px' }} startDecorator={<Folder sx={{ mr: '2px' }} />}>
					<code>{workspace.fileName}</code>
				</Chip>
			</SprocketTooltip>
			<Typography>{workspace.description}</Typography>
		</Card>
	);
}
