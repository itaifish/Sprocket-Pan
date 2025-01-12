import { WorkspaceDataManager } from '@/managers/data/WorkspaceDataManager';
import { getAncestors, getDescendents } from '@/utils/getters';
import { uiActions } from '@/state/ui/slice';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '@/state/store';
import { activeActions, activeThunkName, UpdateLinkedEnv } from './slice';
import { IconButton, Typography } from '@mui/joy';
import { errorToSprocketError } from '@/utils/conversion';
import { SprocketTooltip } from '@/components/shared/SprocketTooltip';
import { appLogDir } from '@tauri-apps/api/path';
import { RustInvoker } from '@/managers/RustInvoker';
import { log } from '@/utils/logging';
import { FluentFolderOpenArrow } from '@/assets/icons/fluent/FluentFolderOpenArrow';

interface RelinkEnvironmentsArgs extends Omit<UpdateLinkedEnv, 'envId'> {
	remove: string[];
	add: string[];
}

export const relinkEnvironments = createAsyncThunk<void, RelinkEnvironmentsArgs, { state: RootState }>(
	`${activeThunkName}/relinkEnvironments`,
	async ({ remove, add, serviceEnvId, serviceId }, thunk) => {
		remove.forEach((envId) => thunk.dispatch(activeActions.removeLinkedEnv({ envId, serviceId })));
		add.forEach((envId) => thunk.dispatch(activeActions.addLinkedEnv({ envId, serviceEnvId, serviceId })));
	},
);

export const saveActiveData = createAsyncThunk<void, void, { state: RootState }>(
	`${activeThunkName}/saveData`,
	async (_, thunk) => {
		const { active, ui, global } = thunk.getState();
		const { lastModified, lastSaved, ...data } = active;
		if (lastModified < lastSaved || ui.orphans != null || global.activeWorkspace == null) return;
		try {
			await WorkspaceDataManager.saveData(data, global.workspaces[global.activeWorkspace]);
			thunk.dispatch(activeActions.setSavedNow());
		} catch (err) {
			log.error(err);
			thunk.dispatch(
				uiActions.toast({
					title: `Failed to save all files`,
					details: (
						<>
							<Typography color="danger" level="body-sm">
								{errorToSprocketError(err).message}
							</Typography>
							<SprocketTooltip text="Open Logs">
								<IconButton
									color="primary"
									variant="plain"
									onClick={async () => {
										const logDir = await appLogDir();
										RustInvoker.showInExplorer({ path: `${logDir}${log.LOG_FILE_NAME}`, absolute: true });
									}}
								>
									<FluentFolderOpenArrow />
								</IconButton>
							</SprocketTooltip>
						</>
					),
					color: 'danger',
				}),
			);
			log.error(err);
		}
	},
);

export const toggleSync = createAsyncThunk<void, string, { state: RootState }>(
	`${activeThunkName}/toggleSync`,
	(id, thunk) => {
		const state = thunk.getState().active;
		if (state.syncMetadata.items[id]) {
			[id, ...getDescendents(state, id)].forEach((itemId) => {
				thunk.dispatch(activeActions.setSyncItem({ id: itemId, value: false }));
			});
		} else {
			[id, ...getAncestors(state, id)].forEach((itemId) => {
				thunk.dispatch(activeActions.setSyncItem({ id: itemId, value: true }));
			});
		}
	},
);
