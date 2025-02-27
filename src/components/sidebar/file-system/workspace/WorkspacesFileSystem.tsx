import { useSelector } from 'react-redux';
import { selectActiveWorkspace, selectWorkspacesList } from '@/state/global/selectors';
import { ActiveWorkspaceFileCard } from './ActiveWorkspaceFileCard';
import { WorkspaceFileCard } from './WorkspaceFileCard';
import { Box, Button, Stack, Typography } from '@mui/joy';
import { SideDrawerHeader } from '../../SideDrawerHeader';
import { useAppDispatch } from '@/state/store';
import { uiActions } from '@/state/ui/slice';
import { useEffect, useState } from 'react';
import { WorkspaceMetadata } from '@/types/data/workspace';
import { useScrollbarTheme } from '@/hooks/useScrollbarTheme';
import { InlineItemName } from '@/components/shared/InlineItemName';
import { SprocketModal } from '@/components/shared/modals/SprocketModal';
import { RemoveCircle, Save } from '@mui/icons-material';
import { globalActions } from '@/state/global/slice';
import { saveActiveData } from '@/state/active/thunks';
import { selectHasBeenModifiedSinceLastSave } from '@/state/active/selectors';

export function WorkspacesFileSystem() {
	const [switchingTo, setSwitchingTo] = useState<WorkspaceMetadata | undefined>(undefined);
	const isModified = useSelector(selectHasBeenModifiedSinceLastSave);
	const { average } = useScrollbarTheme();
	const workspaces = useSelector(selectWorkspacesList);
	const activeWorkspace = useSelector(selectActiveWorkspace);
	const dispatch = useAppDispatch();
	const inactiveWorkspaces = workspaces.filter((workspace) => workspace.fileName !== activeWorkspace?.fileName);
	const onOpenTab = (id: string) => {
		dispatch(uiActions.addTab(id));
		dispatch(uiActions.setSelectedTab(id));
	};
	const switchWorkspace = async (save = false) => {
		setSwitchingTo(undefined);
		if (save) {
			await dispatch(saveActiveData());
		}
		dispatch(globalActions.setSelectedWorkspace(switchingTo));
	};
	useEffect(() => {
		if (switchingTo != null && !isModified) {
			switchWorkspace();
		}
	}, [switchingTo, isModified]);
	return (
		<>
			<SideDrawerHeader content="Workspaces" />
			<Stack gap={1} sx={{ ...average, p: 1, flex: 1, minHeight: '1px', overflow: 'auto' }}>
				{activeWorkspace != null && (
					<Box mb={1}>
						<ActiveWorkspaceFileCard onOpenTab={onOpenTab} workspace={activeWorkspace} />
					</Box>
				)}
				{inactiveWorkspaces.map((workspace) => (
					<div key={workspace.fileName}>
						<WorkspaceFileCard
							onSwitchTo={() => setSwitchingTo(workspace)}
							onOpenTab={onOpenTab}
							workspace={workspace}
						/>
					</div>
				))}
			</Stack>
			<SprocketModal
				size="sm"
				open={isModified && switchingTo != null}
				onClose={() => setSwitchingTo(undefined)}
				title="Switch Active Workspace"
				actions={
					<>
						<Button color="warning" startDecorator={<RemoveCircle />} onClick={() => switchWorkspace()}>
							Switch
						</Button>
						<Button sx={{ width: '70%' }} startDecorator={<Save />} onClick={() => switchWorkspace(true)}>
							Save and Switch
						</Button>
					</>
				}
			>
				<Typography>
					Would you like to save workspace <InlineItemName item={activeWorkspace} /> before switching to workspace{' '}
					<InlineItemName item={switchingTo} />?
				</Typography>
			</SprocketModal>
		</>
	);
}
