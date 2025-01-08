import { Card, Chip, IconButton, Stack, Typography } from '@mui/joy';
import { WorkspaceFileCardContent, WorkspaceFileCardContentProps } from './WorkspaceFileCard';
import { Folder, OpenInNew } from '@mui/icons-material';
import { SprocketTooltip } from '@/components/shared/SprocketTooltip';

interface ActiveWorkspaceFileCardProps extends WorkspaceFileCardContentProps {
	onOpenTab: (id: string) => void;
}

export function ActiveWorkspaceFileCard({ workspace, onOpenTab }: ActiveWorkspaceFileCardProps) {
	return (
		<Card variant="soft">
			<Stack gap={0} alignItems="center" position="absolute" top="-10px" right="-5px">
				<Chip color="success">Active</Chip>
				<SprocketTooltip text="Open Tab">
					<IconButton onClick={() => onOpenTab(workspace.id)}>
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
