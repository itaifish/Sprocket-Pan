import { IconButton } from '@mui/joy';
import DifferenceIcon from '@mui/icons-material/Difference';
import { SprocketTooltip } from '@/components/shared/SprocketTooltip';
import { useAppDispatch } from '@/state/store';
import { tabsActions } from '@/state/tabs/slice';

interface OpenDiffToolButtonProps {
	historyIndex: number;
	id: string;
}

export function OpenDiffToolButton({ historyIndex, id }: OpenDiffToolButtonProps) {
	const dispatch = useAppDispatch();

	const openDiffModal = () => {
		dispatch(tabsActions.addToDiffQueue({ id, index: historyIndex }));
	};
	return (
		<SprocketTooltip text="Show Difference From Another Response">
			<IconButton onClick={openDiffModal}>
				<DifferenceIcon />
			</IconButton>
		</SprocketTooltip>
	);
}
