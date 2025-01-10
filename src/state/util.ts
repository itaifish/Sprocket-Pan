import { ItemType, ShortItemType } from '@/types/data/item';
import { itemActions } from './items';

const shortItemTypes = Object.entries(ShortItemType);

/**
 * Extracts the Item Type from the given id, returns undefined if invalid.
 * @param id The item id (format string:uuid) to parse
 */
export function extractItemType(id: string) {
	for (const [key, type] of shortItemTypes) {
		if (id.startsWith(type)) return key as ItemType;
	}
}

export function extractActions(id: string) {
	const itemType = extractItemType(id);
	if (itemType != null) return { key: itemType, ...itemActions[itemType] };
}
