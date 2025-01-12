import { useSelector } from 'react-redux';
import { selectActiveWorkspace, selectWorkspacesList } from '@/state/global/selectors';
import { ActiveWorkspaceFileCard } from './ActiveWorkspaceFileCard';
import { WorkspaceFileCard } from './WorkspaceFileCard';
import { Box, Stack } from '@mui/joy';
import { SideDrawerHeader } from '../../SideDrawerHeader';
import { useAppDispatch } from '@/state/store';
import { uiActions } from '@/state/ui/slice';
import { AreYouSureModal } from '@/components/shared/modals/AreYouSureModal';
import { useState } from 'react';
import { globalActions } from '@/state/global/slice';
import { WorkspaceMetadata } from '@/types/data/workspace';
import { useScrollbarTheme } from '@/hooks/useScrollbarTheme';

export function WorkspacesFileSystem() {
	const [switchingTo, setSwitchingTo] = useState<WorkspaceMetadata | undefined>(undefined);
	const { average } = useScrollbarTheme();
	const workspaces = useSelector(selectWorkspacesList);
	const activeWorkspace = useSelector(selectActiveWorkspace);
	const dispatch = useAppDispatch();
	const inactiveWorkspaces = workspaces.filter((workspace) => workspace.fileName !== activeWorkspace?.fileName);
	const onOpenTab = (id: string) => {
		dispatch(uiActions.addTab(id));
		dispatch(uiActions.setSelectedTab(id));
	};
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
			<AreYouSureModal
				open={switchingTo != null}
				closeFunc={() => setSwitchingTo(undefined)}
				action={`switch to workspace ${switchingTo?.name} without saving`}
				actionFunc={() => dispatch(globalActions.setSelectedWorkspace(switchingTo))}
			/>
		</>
	);
}
