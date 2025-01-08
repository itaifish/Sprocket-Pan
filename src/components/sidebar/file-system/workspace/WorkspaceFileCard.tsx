import { WorkspaceMetadata } from '@/types/data/workspace';
import { EllipsisTypography } from '@/components/shared/EllipsisTypography';
import { SprocketTooltip } from '@/components/shared/SprocketTooltip';
import { formatShortFullDate, formatRelativeDate } from '@/utils/string';
import { EditCalendar, OpenInNew } from '@mui/icons-material';
import { Box, Card, Chip, Stack } from '@mui/joy';
import { Minidenticon } from '@/components/shared/Minidenticon';
import { useAppDispatch } from '@/state/store';
import { uiActions } from '@/state/ui/slice';
import { FileSystemDropdown, menuOptionDelete } from '../tree/FileSystemDropdown';
import { FluentArrowSwap } from '@/assets/icons/fluent/FluentArrowSwap';

export interface WorkspaceFileCardContentProps {
	workspace: WorkspaceMetadata;
}

export function WorkspaceFileCardContent({ workspace }: WorkspaceFileCardContentProps) {
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

export interface WorkspaceFileCardProps extends WorkspaceFileCardContentProps {
	onOpenTab: (id: string) => void;
	onSwitchTo: (workspace: WorkspaceMetadata) => void;
}

export function WorkspaceFileCard({ workspace, onOpenTab, onSwitchTo }: WorkspaceFileCardProps) {
	const dispatch = useAppDispatch();
	return (
		<Card variant="soft">
			<Box position="absolute" top={10} right={5}>
				<FileSystemDropdown
					options={[
						{ label: 'Switch To', Icon: FluentArrowSwap, onClick: () => onSwitchTo(workspace) },
						{ label: 'Open Tab', Icon: OpenInNew, onClick: () => onOpenTab(workspace.id) },
						menuOptionDelete(() => dispatch(uiActions.addToDeleteQueue(workspace.id))),
					]}
				/>
			</Box>
			<WorkspaceFileCardContent workspace={workspace} />
		</Card>
	);
}
