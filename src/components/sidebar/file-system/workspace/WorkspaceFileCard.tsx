import { WorkspaceMetadata } from '@/types/data/workspace';
import { EllipsisTypography } from '@/components/shared/EllipsisTypography';
import { SprocketTooltip } from '@/components/shared/SprocketTooltip';
import { formatShortFullDate, formatRelativeDate } from '@/utils/string';
import { EditCalendar } from '@mui/icons-material';
import { Box, Card, Chip, Stack } from '@mui/joy';
import { Minidenticon } from '@/components/shared/Minidenticon';
import { FileSystemDropdown, menuOptionDelete } from '../FileSystemDropdown';
import { useAppDispatch } from '@/state/store';
import { tabsActions } from '@/state/tabs/slice';

export interface WorkspaceFileCardProps {
	workspace: WorkspaceMetadata;
}

export function WorkspaceFileCardContent({ workspace }: WorkspaceFileCardProps) {
	return (
		<>
			<Box position="absolute" bottom={-5} right={0} width="45px">
				<Minidenticon username={workspace.fileName} />
			</Box>
			<Stack gap={1} pr={2}>
				<EllipsisTypography>{workspace.name}</EllipsisTypography>
				<SprocketTooltip text={`Last Modified on ${formatShortFullDate(workspace.lastModified)}`}>
					<Chip variant="soft" sx={{ ml: '-6px' }} startDecorator={<EditCalendar sx={{ mr: '2px' }} />}>
						{formatRelativeDate(workspace.lastModified)}
					</Chip>
				</SprocketTooltip>
			</Stack>
		</>
	);
}

export function WorkspaceFileCard({ workspace }: WorkspaceFileCardProps) {
	const dispatch = useAppDispatch();
	return (
		<Card variant="soft">
			<Box position="absolute" top={10} right={5}>
				<FileSystemDropdown options={[menuOptionDelete(() => dispatch(tabsActions.addToDeleteQueue(workspace.id)))]} />
			</Box>
			<WorkspaceFileCardContent workspace={workspace} />
		</Card>
	);
}
