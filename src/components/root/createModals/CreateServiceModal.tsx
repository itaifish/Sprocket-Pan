import { Button, DialogActions, DialogContent, DialogTitle, Divider, Modal, ModalDialog } from '@mui/joy';
import { CreateModalsProps } from './createModalsProps';
import { iconFromTabType } from '../../../types/application-data/application-data';

export function CreateServiceModal({ open, closeFunc }: CreateModalsProps) {
	const createServiceFunction = () => undefined;
	return (
		<Modal
			open={open}
			onClose={() => {
				closeFunc();
			}}
		>
			<ModalDialog variant="outlined" role="alertdialog">
				<DialogTitle>
					{iconFromTabType['service']}
					Create New Service
				</DialogTitle>
				<Divider />
				<DialogContent>Lorem Ipsum Dolar Sit Amit</DialogContent>
				<DialogActions>
					<Button
						variant="solid"
						color="success"
						onClick={() => {
							createServiceFunction();
							closeFunc();
						}}
					>
						Save
					</Button>
					<Button variant="plain" color="neutral" onClick={() => closeFunc()}>
						Cancel
					</Button>
				</DialogActions>
			</ModalDialog>
		</Modal>
	);
}
