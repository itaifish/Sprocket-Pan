import { useEffect } from 'react';
import { fileSystemManager } from '../managers/FileSystemManager';
import { useAppDispatch } from '../state/store';
import { setWorkspaces } from '../state/workspaces/slice';

export function useWorkspaceFileSystemSynchronization() {
	const dispatch = useAppDispatch();
	async function updateWorkspaceSlice() {
		const workspaces = await fileSystemManager.getWorkspaces();
		dispatch(setWorkspaces(workspaces));
	}
	useEffect(() => {
		updateWorkspaceSlice();
		fileSystemManager.on('workspacesChanged', updateWorkspaceSlice);
		return () => {
			fileSystemManager.removeListener('workspacesChanged', updateWorkspaceSlice);
		};
	}, []);
}
