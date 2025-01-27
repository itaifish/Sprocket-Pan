import { Item } from '@/types/data/item';
import { truncate } from '@/utils/string';

interface InlineItemNameProps {
	item?: Item | null;
}

export function InlineItemName({ item }: InlineItemNameProps) {
	return <span style={{ textDecoration: 'underline' }}>{truncate(item?.name)}</span>;
}
