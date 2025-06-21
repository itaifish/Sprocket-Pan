import { WorkspaceMetadata } from '@/types/data/workspace';
import { EllipsisTypography } from '@/components/shared/EllipsisTypography';
import { OpenInNew } from '@mui/icons-material';
import { Box, Card, Stack, useTheme } from '@mui/joy';
import { Minidenticon } from '@/components/shared/Minidenticon';
import { useAppDispatch } from '@/state/store';
import { uiActions } from '@/state/ui/slice';
import { FileSystemDropdown, menuOptionDelete } from '../tree/FileSystemDropdown';
import { FluentArrowSwap } from '@/assets/icons/fluent/FluentArrowSwap';
import { RelativeTimeChip } from '@/components/shared/RelativeTimeChip';

export interface WorkspaceFileCardContentProps {
	workspace: WorkspaceMetadata;
}

export function WorkspaceFileCardContent({ workspace }: WorkspaceFileCardContentProps) {
	return (
		<>
			<Box position="absolute" bottom={-5} right={0} width="45px">
				<Minidenticon username={workspace.minidenticon} />
			</Box>
			<Stack gap={1} pr={2}>
				<EllipsisTypography>{workspace.name}</EllipsisTypography>
				<RelativeTimeChip date={workspace.lastModified} />
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
	const theme = useTheme();
	return (
		<Card variant="plain" sx={{ backgroundColor: theme.palette.background.level1 }}>
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
