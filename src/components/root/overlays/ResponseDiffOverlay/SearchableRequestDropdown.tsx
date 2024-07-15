import { Autocomplete, FormControl, FormLabel } from '@mui/joy';
import { iconFromTabType } from '../../../../types/application-data/application-data';
import { camelCaseToTitle } from '../../../../utils/string';

type Option = { label: string; value: string };

interface SearchableRequestDropdownProps {
	name: 'service' | 'request' | 'endpoint';
	options: Option[];
	value: Option;
	onChange: (newValue: Option) => void;
}

export function SearchableRequestDropdown({ name, options, value, onChange }: SearchableRequestDropdownProps) {
	return (
		<FormControl>
			<FormLabel>{camelCaseToTitle(name)}</FormLabel>
			<Autocomplete
				disableClearable
				startDecorator={iconFromTabType[name]}
				autoHighlight
				value={value}
				onChange={(_event, newValue) => {
					if (newValue != null) {
						onChange(newValue);
					}
				}}
				options={options}
			></Autocomplete>
		</FormControl>
	);
}
