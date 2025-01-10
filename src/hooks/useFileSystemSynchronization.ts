import { GlobalDataManager } from '@/managers/data/GlobalDataManager';
import { globalActions } from '@/state/global/slice';
import { useAppDispatch } from '@/state/store';
import { useEffect } from 'react';

export function useFileSystemSynchronization() {
	const dispatch = useAppDispatch();
	async function updateWorkspaceSlice() {
		const workspaces = await GlobalDataManager.getWorkspaces();
		const data = await GlobalDataManager.getGlobalData();
		dispatch(globalActions.setData(data));
		dispatch(globalActions.setWorkspaces(workspaces));
	}
	useEffect(() => {
		updateWorkspaceSlice();
	}, []);
}
