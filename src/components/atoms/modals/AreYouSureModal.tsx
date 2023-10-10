import { Button, DialogActions, DialogContent, DialogTitle, Divider, Modal, ModalDialog } from '@mui/joy';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';

interface AreYouSureModalProps {
	open: boolean;
	closeFunc: () => void;
	action: string;
	actionFunc: () => void;
}

export function AreYouSureModal(props: AreYouSureModalProps) {
	const { open, closeFunc, actionFunc, action } = props;
	return (
		<Modal open={open} onClose={() => closeFunc()}>
			<ModalDialog variant="outlined" role="alertdialog">
				<DialogTitle>
					<WarningRoundedIcon />
					Confirmation
				</DialogTitle>
				<Divider />
				<DialogContent>Are you sure you want to {action}?</DialogContent>
				<DialogActions>
					<Button
						variant="solid"
						color="danger"
						onClick={() => {
							closeFunc();
							actionFunc();
						}}
					>
						Yes, {action}!
					</Button>
					<Button variant="plain" color="neutral" onClick={() => closeFunc()}>
						Cancel
					</Button>
				</DialogActions>
			</ModalDialog>
		</Modal>
	);
}
