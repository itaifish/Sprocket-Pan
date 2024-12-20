import { useSelector } from 'react-redux';
import { useAppDispatch } from '../../../state/store';
import { selectNextForDiff } from '../../../state/tabs/selectors';
import { DialogTitle, Divider, Modal, ModalClose, ModalDialog } from '@mui/joy';
import { ResponseDiffOverlay } from '../overlays/ResponseDiffOverlay/ResponseDiffOverlay';
import { tabsActions } from '../../../state/tabs/slice';

export function DiffQueueModals() {
	const nextForDiff = useSelector(selectNextForDiff);
	const dispatch = useAppDispatch();

	return (
		<Modal open={!!nextForDiff} onClose={() => dispatch(tabsActions.popDiffQueue())}>
			<ModalDialog variant="outlined" role="diffdialog">
				<ModalClose />
				<DialogTitle>Diff Tool</DialogTitle>
				<Divider />
				<ResponseDiffOverlay initialSelection={nextForDiff} />
			</ModalDialog>
		</Modal>
	);
}
