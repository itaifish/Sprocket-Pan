import { GlobalDataManager } from '@/managers/data/GlobalDataManager';
import { fileSystemEmitter, FILE_SYSTEM_CHANGE_EVENT } from '@/managers/file-system/FileSystemEmitter';
import { FileSystemManager } from '@/managers/file-system/FileSystemManager';
import { globalActions } from '@/state/global/slice';
import { useAppDispatch } from '@/state/store';
import { useEffect } from 'react';

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
