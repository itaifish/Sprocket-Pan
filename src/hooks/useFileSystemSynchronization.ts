import { useEffect } from 'react';
import { FileSystemManager } from '../managers/file-system/FileSystemManager';
import { useAppDispatch } from '../state/store';
import { globalActions } from '../state/global/slice';
import { GlobalDataManager } from '../managers/data/GlobalDataManager';
import { FILE_SYSTEM_CHANGE_EVENT, fileSystemEmitter } from '../managers/file-system/FileSystemEmitter';

export function useFileSystemSynchronization() {
	const dispatch = useAppDispatch();
	async function updateWorkspaceSlice() {
		const workspaces = await FileSystemManager.getWorkspaces();
		const data = await GlobalDataManager.getGlobalData();
		dispatch(globalActions.setData(data));
		dispatch(globalActions.setWorkspaces(workspaces));
	}
	useEffect(() => {
		updateWorkspaceSlice();
		fileSystemEmitter.on(FILE_SYSTEM_CHANGE_EVENT, updateWorkspaceSlice);
		return () => {
			fileSystemEmitter.removeListener(FILE_SYSTEM_CHANGE_EVENT, updateWorkspaceSlice);
		};
	}, []);
}
