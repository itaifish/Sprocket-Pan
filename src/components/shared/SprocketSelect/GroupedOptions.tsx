import { groupBy } from '@/utils/variables';

export interface SelectOption<T> {
	value: T;
	label: string;
	group?: string;
}

interface GroupedOptionsProps<T> {
	options: SelectOption<T>[];
	aria: string;
}

export function GroupedOptions<T>({ options }: GroupedOptionsProps<T>) {
	const groups = groupBy(options, ({ group }) => group ?? 'ungrouped');
	console.log({ groups });
	return null;
}
