import { Autocomplete, FormControl, FormLabel } from '@mui/joy';
import {
	Endpoint,
	EndpointRequest,
	iconFromTabType,
	Service,
} from '../../../../types/application-data/application-data';
import { camelCaseToTitle } from '../../../../utils/string';

type Option = { label: string; value?: string };

interface SearchableRequestDropdownProps {
	name: 'service' | 'request' | 'endpoint';
	options: Record<string, Service | Endpoint | EndpointRequest>;
	selected?: Service | Endpoint | EndpointRequest;
	onChange: (newValue: Option) => void;
}

export function SearchableRequestDropdown({ name, options, selected, onChange }: SearchableRequestDropdownProps) {
	const title = camelCaseToTitle(name);
	return (
		<FormControl>
			<FormLabel>{title}</FormLabel>
			<Autocomplete
				disableClearable
				startDecorator={iconFromTabType[name]}
				autoHighlight
				value={{
					label: selected?.name ?? `No ${title} Selected`,
					value: selected?.id,
				}}
				onChange={(_event, newValue) => {
					if (newValue != null) {
						onChange(newValue);
					}
				}}
				options={Object.values(options).map((option) => ({ label: option.name, value: option.id }))}
			></Autocomplete>
		</FormControl>
	);
}
