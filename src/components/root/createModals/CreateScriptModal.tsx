import { Button, DialogActions, DialogContent, DialogTitle, Divider, Modal, ModalDialog } from '@mui/joy';
import { CreateModalsProps } from './createModalsProps';
import { iconFromTabType } from '../../../types/application-data/application-data';
import { useMemo } from 'react';

export function CreateScriptModal({ open, closeFunc }: CreateModalsProps) {
	const createScriptFunction = () => undefined;
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
					{iconFromTabType['script']}
					Create New Script
				</DialogTitle>
				<Divider />
				<DialogContent>Lorem Ipsum Dolar Sit Amit</DialogContent>
				<DialogActions>
					<Button
						variant="solid"
						color="success"
						disabled={!allFieldsValid}
						onClick={() => {
							createScriptFunction();
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
