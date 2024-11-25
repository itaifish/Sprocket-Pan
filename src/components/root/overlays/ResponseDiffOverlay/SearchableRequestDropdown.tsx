import { Autocomplete, FormControl, FormLabel, IconButton, Stack } from '@mui/joy';
import {
	Endpoint,
	EndpointRequest,
	iconFromTabType,
	Service,
} from '../../../../types/application-data/application-data';
import { camelCaseToTitle } from '../../../../utils/string';
import { SprocketTooltip } from '../../../shared/SprocketTooltip';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useAppDispatch } from '../../../../state/store';
import { tabsActions } from '../../../../state/tabs/slice';

type Option = { label: string; value?: string };

interface SearchableRequestDropdownProps {
	name: 'service' | 'request' | 'endpoint';
	options: Array<Service | Endpoint | EndpointRequest>;
	selected?: Service | Endpoint | EndpointRequest;
	onChange: (newValue: Option) => void;
}

export function SearchableRequestDropdown({ name, options, selected, onChange }: SearchableRequestDropdownProps) {
	const dispatch = useAppDispatch();
	const title = camelCaseToTitle(name);
	return (
		<FormControl>
			<FormLabel>{title}</FormLabel>
			<Stack direction="row">
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
					options={options.map((option) => ({ label: option.name, value: option.id }))}
				></Autocomplete>
				<SprocketTooltip text={`Open ${title}`}>
					<IconButton
						disabled={!selected}
						color={'primary'}
						onClick={() => {
							if (!!selected) {
								dispatch(tabsActions.addTabs({ [selected.id]: name }));
								dispatch(tabsActions.setSelectedTab(selected.id));
								dispatch(tabsActions.popDiffQueue());
							}
						}}
					>
						<OpenInNewIcon />
					</IconButton>
				</SprocketTooltip>
			</Stack>
		</FormControl>
	);
}
