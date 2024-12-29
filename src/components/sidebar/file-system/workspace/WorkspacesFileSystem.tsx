import { useSelector } from 'react-redux';
import { selectActiveWorkspace, selectWorkspacesList } from '@/state/global/selectors';
import { ActiveWorkspaceFileCard } from './ActiveWorkspaceFileCard';
import { WorkspaceFileCard } from './WorkspaceFileCard';
import { Box, Stack } from '@mui/joy';
import { SideDrawerHeader } from '../../SideDrawerHeader';

export function WorkspacesFileSystem() {
	const workspaces = useSelector(selectWorkspacesList);
	const activeWorkspace = useSelector(selectActiveWorkspace);
	const inactiveWorkspaces = workspaces.filter((workspace) => workspace.fileName !== activeWorkspace?.fileName);
	return (
		<>
			<SideDrawerHeader content="Workspaces" />
			<Stack gap={1} px={1} pb={1}>
				{activeWorkspace != null && (
					<Box mb={1}>
						<ActiveWorkspaceFileCard workspace={activeWorkspace} />
					</Box>
				)}
				{inactiveWorkspaces.map((workspace) => (
					<div key={workspace.fileName}>
						<WorkspaceFileCard workspace={workspace} />
					</div>
				))}
			</Stack>
		</>
	);
}
