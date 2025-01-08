import { useSelector } from 'react-redux';
import { selectActiveWorkspace, selectWorkspacesList } from '@/state/global/selectors';
import { ActiveWorkspaceFileCard } from './ActiveWorkspaceFileCard';
import { WorkspaceFileCard } from './WorkspaceFileCard';
import { Box, Stack } from '@mui/joy';
import { SideDrawerHeader } from '../../SideDrawerHeader';
import { useAppDispatch } from '@/state/store';
import { uiActions } from '@/state/ui/slice';

export function WorkspacesFileSystem() {
	const workspaces = useSelector(selectWorkspacesList);
	const activeWorkspace = useSelector(selectActiveWorkspace);
	const dispatch = useAppDispatch();
	const inactiveWorkspaces = workspaces.filter((workspace) => workspace.fileName !== activeWorkspace?.fileName);
	const onOpenTab = (id: string) => {
		dispatch(uiActions.addTabs({ [id]: 'workspace' }));
		dispatch(uiActions.setSelectedTab(id));
	};
	const onSwitchTo = () => {};
	return (
		<>
			<SideDrawerHeader content="Workspaces" />
			<Stack gap={1} px={1} pb={1}>
				{activeWorkspace != null && (
					<Box mb={1}>
						<ActiveWorkspaceFileCard onOpenTab={onOpenTab} workspace={activeWorkspace} />
					</Box>
				)}
				{inactiveWorkspaces.map((workspace) => (
					<div key={workspace.fileName}>
						<WorkspaceFileCard onSwitchTo={onSwitchTo} onOpenTab={onOpenTab} workspace={workspace} />
					</div>
				))}
			</Stack>
		</>
	);
}
