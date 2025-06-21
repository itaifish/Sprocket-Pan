import { ItemPrefix, ItemProperty, ItemType } from '@/types/data/item';
import { WorkspaceItems } from '@/types/data/workspace';

const itemPrefixes = Object.entries(ItemPrefix);

/**
 * Extracts the Item Type from the given id, returns undefined if invalid.
 * @param id The item id (format string:uuid) to parse
 */
export function extractItemType(id: string) {
	for (const [key, type] of itemPrefixes) {
		if (id.startsWith(type)) {
			return key as ItemType;
		}
	}
}

export function extractProperty(id: string) {
	const type = extractItemType(id);
	return type == null ? null : ItemProperty[type];
}

export function getDescendents(state: WorkspaceItems, id: string): string[] {
	if (id.startsWith(ItemPrefix.endpoint)) {
		return state.endpoints[id].requestIds;
	}
	if (id.startsWith(ItemPrefix.service)) {
		return state.services[id].endpointIds.flatMap((id) => [id, ...state.endpoints[id].requestIds]);
	}
	return [];
}

export function getAncestors(state: WorkspaceItems, id: string): string[] {
	if (id.startsWith(ItemPrefix.endpoint)) {
		return [state.endpoints[id].serviceId];
	}
	if (id.startsWith(ItemPrefix.request)) {
		const endId = state.requests[id].endpointId;
		return [endId, state.endpoints[endId].serviceId];
	}
	return [];
}
