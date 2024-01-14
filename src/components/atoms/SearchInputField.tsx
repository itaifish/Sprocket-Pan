import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { Input } from '@mui/joy';
import { useDebounce } from '../../hooks/useDebounce';
import { useState } from 'react';
import PendingOutlinedIcon from '@mui/icons-material/PendingOutlined';
import SavedSearchIcon from '@mui/icons-material/SavedSearch';
import { Constants } from '../../utils/constants';

export function SearchInputField({
	searchText,
	setSearchText,
}: {
	searchText: string;
	setSearchText: React.Dispatch<React.SetStateAction<string>>;
}) {
	const { localDataState, setLocalDataState, debounceEventEmitter } = useDebounce({
		state: searchText,
		setState: setSearchText,
		debounceOverride: Constants.searchDebounceTimeMS,
	});
	const [isTyping, setTyping] = useState(false);
	debounceEventEmitter.on('sync', () => {
		if (isTyping) {
			setTyping(false);
		}
	});
	debounceEventEmitter.on('desync', () => {
		if (!isTyping) {
			setTyping(true);
		}
	});
	return (
		<Input
			size="sm"
			variant="outlined"
			placeholder="Search for something"
			startDecorator={<SearchRoundedIcon color="primary" />}
			endDecorator={
				searchText === '' && localDataState === '' ? (
					<></>
				) : isTyping ? (
					<PendingOutlinedIcon color="secondary" />
				) : (
					<SavedSearchIcon color="action" />
				)
			}
			sx={{
				boxShadow: 'sm',
				width: '100%',
			}}
			value={localDataState}
			onChange={(e) => setLocalDataState(e.target.value)}
		/>
	);
}
