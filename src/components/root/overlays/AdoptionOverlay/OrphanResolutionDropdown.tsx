import { EllipsisTypography } from '@/components/shared/EllipsisTypography';
import { SelectOption } from '@/components/shared/input/SprocketSelect';
import { SprocketSelect } from '@/components/shared/input/SprocketSelect';
import { WorkspaceItem } from '@/types/data/workspace';
import { Stack } from '@mui/joy';

export enum OrphanResolution {
	revive = 'revive',
	create = 'create',
	delete = 'delete',
	assign = 'assign',
	none = 'none',
}

interface OrphanResolutionDropdownProps {
	name: string;
	parentName?: string;
	parentType: string;
	adoptors: WorkspaceItem[];
	onChange: (id: string) => void;
	value: string;
}

export function OrphanResolutionDropdown({
	name,
	parentName,
	parentType,
	adoptors,
	onChange,
	value,
}: OrphanResolutionDropdownProps) {
	const options: SelectOption<string>[] = [{ value: OrphanResolution.delete, label: `Discard ${name}` }];
	if (parent == null) {
		options.push({ value: OrphanResolution.create, label: `Assign to New ${parentType}` });
		options.push(...adoptors.map((adoptor) => ({ value: adoptor.id, label: `Assign to ${adoptor.name}` })));
	} else {
		options.push({ value: OrphanResolution.revive, label: `Revive ${parentName} ${parentType}` });
	}
	return (
		<Stack direction="row" alignItems="center">
			<EllipsisTypography width="100%">{name}</EllipsisTypography>
			<SprocketSelect
				placeholder="Select Resolution"
				sx={{ width: '100%' }}
				value={value ?? null}
				onChange={onChange}
				options={options}
			/>
		</Stack>
	);
}
