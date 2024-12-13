import { IconButton } from '@mui/joy';
import DifferenceIcon from '@mui/icons-material/Difference';
import { SprocketTooltip } from '@/components/shared/SprocketTooltip';
import { useAppDispatch } from '@/state/store';
import { tabsActions } from '@/state/tabs/slice';
import { EndpointRequest } from '@/types/data/workspace';

interface OpenDiffToolButtonProps {
	historyIndex: number;
	request: EndpointRequest;
}

export function OpenDiffToolButton({ historyIndex, request }: OpenDiffToolButtonProps) {
	const dispatch = useAppDispatch();

	const openDiffModal = () => {
		dispatch(tabsActions.addToDiffQueue({ request, index: historyIndex }));
	};
	return (
		<SprocketTooltip text="Show Difference From Another Response">
			<IconButton onClick={openDiffModal}>
				<DifferenceIcon />
			</IconButton>
		</SprocketTooltip>
	);
}
