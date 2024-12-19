import { WorkspaceItems, WorkspaceItemType } from '@/types/data/workspace';

export function getWorkspaceItemType(state: WorkspaceItems, id: string) {
	const keys = Object.keys(state) as WorkspaceItemType[];
	return keys.find((key) => state[key][id] != null);
}

export function getDefinedWorkspaceItemType(state: WorkspaceItems, id: string) {
	const type = getWorkspaceItemType(state, id);
	if (type == null) throw new Error(`orphan id detected: ${id}`);
	return type;
}

export function getDescendents(state: WorkspaceItems, id: string): string[] {
	const type = getDefinedWorkspaceItemType(state, id);
	switch (type) {
		case 'environments':
		case 'scripts':
		case 'requests':
			return [];
		case 'endpoints':
			return state[type][id].requestIds;
		case 'services':
			return state[type][id].endpointIds.flatMap((id) => [id, ...state.endpoints[id].requestIds]);
	}
}

export function getAncestors(state: WorkspaceItems, id: string): string[] {
	const type = getDefinedWorkspaceItemType(state, id);
	switch (type) {
		case 'environments':
		case 'scripts':
		case 'services':
			return [];
		case 'endpoints':
			return [state[type][id].serviceId];
		case 'requests':
			const endId = state[type][id].endpointId;
			return [endId, state.endpoints[endId].serviceId];
	}
}
