import { deleteWorkspace } from '@/state/global/thunks';
import { Item, WorkspaceItems, WorkspaceMetadata } from '@/types/data/workspace';
import { AsyncThunk } from '@reduxjs/toolkit';
import { deleteEndpoint } from '../active/thunks/endpoints';
import { deleteEnvironmentById } from '../active/thunks/environments';
import { deleteRequest } from '../active/thunks/requests';
import { deleteScriptById } from '../active/thunks/scripts';
import { deleteService } from '../active/thunks/services';
import { RootState } from '../store';

interface ItemData extends WorkspaceItems {
	workspaces: Record<string, WorkspaceMetadata>;
}

export interface ItemsActions {
	[key: string]: {
		delete: AsyncThunk<any, string, any>;
		getItem: (data: ItemData, id: string) => Item | undefined;
	};
}

export const itemsActions: ItemsActions = {
	endpoint: { delete: deleteEndpoint, getItem: (data, id) => data.endpoints[id] },
	service: { delete: deleteService, getItem: (data, id) => data.services[id] },
	request: { delete: deleteRequest, getItem: (data, id) => data.requests[id] },
	script: { delete: deleteScriptById, getItem: (data, id) => data.scripts[id] },
	environment: { delete: deleteEnvironmentById, getItem: (data, id) => data.environments[id] },
	workspace: { delete: deleteWorkspace, getItem: (data, id) => data.workspaces[id] },
};

const itemsActionsList = Object.entries(itemsActions).map(([key, value]) => ({ key, ...value }));

export function getItemActions(data: ItemData, id: string) {
	for (const actions of itemsActionsList) {
		const item = actions.getItem(data, id);
		if (item != null) return { ...actions, item };
	}
}

export function getItemActionsByState({ global, active }: RootState, id: string) {
	return getItemActions({ ...active, workspaces: global.workspaces }, id);
}

export function getDefinedItemActions(data: ItemData, id: string) {
	const actions = getItemActions(data, id);
	if (actions == null) throw new Error(`could not associate ${id} with any items in state`);
	return actions;
}
