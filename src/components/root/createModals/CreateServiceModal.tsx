import { Button, DialogActions, DialogContent, DialogTitle, Divider, Modal, ModalDialog } from '@mui/joy';
import { CreateModalsProps } from './createModalsProps';
import { iconFromTabType } from '../../../types/application-data/application-data';
import { useMemo } from 'react';

export function CreateServiceModal({ open, closeFunc }: CreateModalsProps) {
	const createServiceFunction = () => undefined;
	const allFieldsValid = useMemo(() => true, []);
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
						variant="outlined"
						color="success"
						disabled={!allFieldsValid}
						onClick={() => {
							createServiceFunction();
							closeFunc();
						}}
					>
						Save
					</Button>
					<Button variant="outlined" color="warning" onClick={() => closeFunc()}>
						Cancel
					</Button>
				</DialogActions>
			</ModalDialog>
		</Modal>
	);
}
