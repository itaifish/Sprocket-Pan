import { useSelector } from 'react-redux';
import { DialogTitle, Divider, Modal, ModalClose, ModalDialog } from '@mui/joy';
import { useAppDispatch } from '@/state/store';
import { tabsActions } from '@/state/tabs/slice';
import { selectOrphans } from '@/state/tabs/selectors';
import { AdoptionOverlay } from '../overlays/AdoptionOverlay/AdoptionOverlay';

export function AdoptionModals() {
	const orphans = useSelector(selectOrphans);
	const dispatch = useAppDispatch();

	const onClose = () => dispatch(tabsActions.setOrphans(null));

	return (
		<Modal
			open={!!orphans}
			onClose={(_, reason) => {
				if (reason === 'backdropClick') return;
				onClose();
			}}
		>
			<ModalDialog variant="outlined" role="adoptiondialog">
				<ModalClose />
				<DialogTitle>Orphaned Items Resolution</DialogTitle>
				<Divider />
				<AdoptionOverlay orphans={orphans} onClose={onClose} />
			</ModalDialog>
		</Modal>
	);
}
