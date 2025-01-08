import { ItemType } from '@/types/data/item';
import { itemActions } from './items';

export const itemTypes = Object.values(ItemType);

/**
 * Extracts the Item Type from the given id, returns undefined if invalid.
 * @param id The item id (format string:uuid) to parse
 */
export function extractItemType(id: string) {
	const str = id.split(':');
	for (const type of itemTypes) {
		if (str[0] === type) return type;
	}
}

export function extractActions(id: string) {
	const itemType = extractItemType(id);
	if (itemType != null) return { key: itemType, ...itemActions[itemType] };
}
