import { Autocomplete, FormControl, FormLabel, IconButton, Stack } from '@mui/joy';
import { iconFromTabType } from '../../../../types/application-data/application-data';
import { camelCaseToTitle } from '../../../../utils/string';
import { SprocketTooltip } from '../../../shared/SprocketTooltip';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useAppDispatch } from '../../../../state/store';
import { tabsActions } from '../../../../state/tabs/slice';

type SearchableItem = { name: string; id: string };

interface SearchableRequestDropdownProps<T extends SearchableItem> {
	name: 'service' | 'request' | 'endpoint';
	options: T[];
	selected?: T | null;
	onChange: (id: string | null) => void;
}

export function SearchableRequestDropdown<T extends SearchableItem>({
	name,
	options,
	selected,
	onChange,
}: SearchableRequestDropdownProps<T>) {
	const dispatch = useAppDispatch();
	const title = camelCaseToTitle(name);
	const autocompleteOptions = options.map((option) => ({ label: option.name, id: option.id }));
	return (
		<FormControl>
			<FormLabel>{title}</FormLabel>
			<Stack direction="row">
				<Autocomplete
					startDecorator={iconFromTabType[name]}
					autoHighlight
					placeholder={`No ${title} Selected`}
					value={selected?.id == null ? null : { label: selected.name, id: selected.id }}
					isOptionEqualToValue={(option, value) => option.id === value.id}
					onChange={(_, nval) => onChange(nval?.id ?? null)}
					options={autocompleteOptions}
				/>
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
