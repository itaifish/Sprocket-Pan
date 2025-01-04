import { useSelector } from 'react-redux';
import { DialogTitle, Divider, Modal, ModalClose, ModalDialog } from '@mui/joy';
import { ResponseDiffOverlay } from '../overlays/ResponseDiffOverlay/ResponseDiffOverlay';
import { useAppDispatch } from '@/state/store';
import { selectNextForDiff } from '@/state/ui/selectors';
import { uiActions } from '@/state/ui/slice';

export function DiffQueueModals() {
	const nextForDiff = useSelector(selectNextForDiff);
	const dispatch = useAppDispatch();

	return (
		<Modal open={!!nextForDiff} onClose={() => dispatch(uiActions.popDiffQueue())}>
			<ModalDialog variant="outlined" role="diffdialog">
				<ModalClose />
				<DialogTitle>Diff Tool - Compare Responses</DialogTitle>
				<Divider />
				<ResponseDiffOverlay initialSelection={nextForDiff} />
			</ModalDialog>
		</Modal>
	);
}
