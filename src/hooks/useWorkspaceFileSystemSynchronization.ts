import { useEffect } from 'react';
import { fileSystemManager } from '../managers/file-system/FileSystemManager';
import { useAppDispatch } from '../state/store';
import { FILE_SYSTEM_CHANGE_EVENT } from '../managers/file-system/FileSystemManager';
import { globalActions } from '../state/global/slice';

export function useWorkspaceFileSystemSynchronization() {
	const dispatch = useAppDispatch();
	async function updateWorkspaceSlice() {
		const workspaces = await fileSystemManager.getWorkspaces();
		dispatch(globalActions.setWorkspaces(workspaces));
	}
	useEffect(() => {
		updateWorkspaceSlice();
		fileSystemManager.on(FILE_SYSTEM_CHANGE_EVENT, updateWorkspaceSlice);
		return () => {
			fileSystemManager.removeListener(FILE_SYSTEM_CHANGE_EVENT, updateWorkspaceSlice);
		};
	}, []);
}
