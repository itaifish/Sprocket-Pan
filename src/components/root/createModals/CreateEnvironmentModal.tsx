import { Button, DialogActions, DialogContent, DialogTitle, Divider, Modal, ModalDialog } from '@mui/joy';
import { CreateModalsProps } from './createModalsProps';
import { iconFromTabType } from '../../../types/application-data/application-data';
import { useMemo } from 'react';

export function CreateEnvironmentModal({ open, closeFunc }: CreateModalsProps) {
	const createEnvironmentFunction = () => undefined;
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
					{iconFromTabType['environment']}
					Create New Environment
				</DialogTitle>
				<Divider />
				<DialogContent>Lorem Ipsum Dolar Sit Amit</DialogContent>
				<DialogActions>
					<Button
						variant="solid"
						color="success"
						disabled={!allFieldsValid}
						onClick={() => {
							createEnvironmentFunction();
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
