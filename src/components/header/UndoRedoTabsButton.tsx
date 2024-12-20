import UndoRoundedIcon from '@mui/icons-material/UndoRounded';
import RedoRoundedIcon from '@mui/icons-material/RedoRounded';
import { Stack, IconButton } from '@mui/joy';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../../state/store';
import { selectPeekHistory } from '../../state/tabs/selectors';
import { SprocketTooltip } from '../shared/SprocketTooltip';
import { tabsActions } from '../../state/tabs/slice';

export function UndoRedoTabsButton() {
	const { previous: goBackIndex, next: goForwardIndex } = useSelector(selectPeekHistory);
	const dispatch = useAppDispatch();

	return (
		<Stack direction={'row'} spacing={0} justifyContent={'flex-end'}>
			<SprocketTooltip text="Previous Tab">
				<IconButton
					variant="outlined"
					disabled={goBackIndex == null}
					onClick={() => dispatch(tabsActions.setSelectedTabFromHistory(goBackIndex))}
				>
					<UndoRoundedIcon />
				</IconButton>
			</SprocketTooltip>
			<SprocketTooltip text="Next Tab">
				<IconButton
					variant="outlined"
					disabled={goForwardIndex == null}
					onClick={() => dispatch(tabsActions.setSelectedTabFromHistory(goForwardIndex))}
				>
					<RedoRoundedIcon />
				</IconButton>
			</SprocketTooltip>
		</Stack>
	);
}
