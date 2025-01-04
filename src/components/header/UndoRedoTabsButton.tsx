import UndoRoundedIcon from '@mui/icons-material/UndoRounded';
import RedoRoundedIcon from '@mui/icons-material/RedoRounded';
import { Stack, IconButton } from '@mui/joy';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '@/state/store';
import { selectPeekHistory } from '@/state/ui/selectors';
import { uiActions } from '@/state/ui/slice';
import { SprocketTooltip } from '../shared/SprocketTooltip';

export function UndoRedoTabsButton() {
	const { previous: goBackIndex, next: goForwardIndex } = useSelector(selectPeekHistory);
	const dispatch = useAppDispatch();

	return (
		<Stack direction="row" spacing={0} justifyContent="flex-end">
			<SprocketTooltip text="Previous Tab">
				<IconButton
					disabled={goBackIndex == null}
					onClick={() => dispatch(uiActions.setSelectedTabFromHistory(goBackIndex))}
				>
					<UndoRoundedIcon />
				</IconButton>
			</SprocketTooltip>
			<SprocketTooltip text="Next Tab">
				<IconButton
					disabled={goForwardIndex == null}
					onClick={() => dispatch(uiActions.setSelectedTabFromHistory(goForwardIndex))}
				>
					<RedoRoundedIcon />
				</IconButton>
			</SprocketTooltip>
		</Stack>
	);
}
