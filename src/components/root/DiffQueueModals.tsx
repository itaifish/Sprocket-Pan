import { useSelector } from 'react-redux';
import { useAppDispatch } from '../../state/store';
import { selectNextForDiff } from '../../state/tabs/selectors';
import { DialogTitle, Divider, Modal, ModalClose, ModalDialog } from '@mui/joy';
import { popDiffQueue } from '../../state/tabs/slice';
import { ResponseDiffOverlay } from './overlays/ResponseDiffOverlay';

export function DiffQueueModals() {
	const nextForDiff = useSelector(selectNextForDiff);
	const dispatch = useAppDispatch();

	return (
		<Modal open={!!nextForDiff} onClose={() => dispatch(popDiffQueue())}>
			<ModalDialog variant="outlined" role="diffdialog">
				<ModalClose />
				<DialogTitle>Diff Tool</DialogTitle>
				<Divider />
				<ResponseDiffOverlay initialSelection={nextForDiff} />
			</ModalDialog>
		</Modal>
	);
}
