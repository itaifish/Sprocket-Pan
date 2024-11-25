import { IconButton } from '@mui/joy';
import { SprocketTooltip } from '../../../shared/SprocketTooltip';
import DifferenceIcon from '@mui/icons-material/Difference';
import { EndpointRequest } from '../../../../types/application-data/application-data';
import { useAppDispatch } from '../../../../state/store';
import { tabsActions } from '../../../../state/tabs/slice';

interface OpenDiffToolButtonProps {
	historyIndex: number;
	request: EndpointRequest;
}

export function OpenDiffToolButton({ historyIndex, request }: OpenDiffToolButtonProps) {
	const dispatch = useAppDispatch();

	const openDiffModal = () => {
		dispatch(
			tabsActions.addToDiffQueue({
				left: { requestId: request.id, historyIndex },
				right: { requestId: request.id, historyIndex },
			}),
		);
	};
	return (
		<SprocketTooltip text="Show Difference From Another Response">
			<IconButton onClick={openDiffModal}>
				<DifferenceIcon />
			</IconButton>
		</SprocketTooltip>
	);
}
