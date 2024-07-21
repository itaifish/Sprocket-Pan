import { IconButton } from '@mui/joy';
import { SprocketTooltip } from '../../../shared/SprocketTooltip';
import DifferenceIcon from '@mui/icons-material/Difference';
import { EndpointRequest } from '../../../../types/application-data/application-data';
import { addToDiffQueue } from '../../../../state/tabs/slice';
import { useAppDispatch } from '../../../../state/store';

interface OpenDiffToolButtonProps {
	historyIndex: number;
	request: EndpointRequest;
}

export function OpenDiffToolButton({ historyIndex, request }: OpenDiffToolButtonProps) {
	const dispatch = useAppDispatch();

	const openDiffModal = () => {
		dispatch(
			addToDiffQueue({
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
