import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { IconButton, Input, Stack } from '@mui/joy';
import { useDebounce } from '../../hooks/useDebounce';
import { useEffect, useState } from 'react';
import PendingOutlinedIcon from '@mui/icons-material/PendingOutlined';
import SavedSearchIcon from '@mui/icons-material/SavedSearch';
import { Constants } from '../../utils/constants';
import ClearIcon from '@mui/icons-material/Clear';
import { selectSearchText } from '../../state/tabs/selectors';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../../state/store';
import { setSearchText } from '../../state/tabs/slice';
import { SprocketTooltip } from '../shared/SprocketTooltip';

export function SearchInputField() {
	const searchText = useSelector(selectSearchText);
	const dispatch = useAppDispatch();
	const setState = (text: string) => dispatch(setSearchText(text));
	const { localDataState, setLocalDataState, debounceEventEmitter } = useDebounce({
		state: searchText,
		setState,
		debounceOverride: Constants.searchDebounceTimeMS,
	});
	const [isTyping, setTyping] = useState(false);
	useEffect(() => {
		debounceEventEmitter.on('sync', () => {
			setTyping(false);
		});
		debounceEventEmitter.on('desync', () => {
			setTyping(true);
		});
	}, []);

	return (
		<>
			<Stack direction={'row'}>
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
				<SprocketTooltip text="Clear Search">
					<IconButton
						size="sm"
						variant="plain"
						color={'danger'}
						onClick={() => {
							setLocalDataState('');
							setState('');
							setTyping(false);
						}}
					>
						<ClearIcon />
					</IconButton>
				</SprocketTooltip>
			</Stack>
		</>
	);
}
