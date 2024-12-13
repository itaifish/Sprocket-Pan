import {
	Button,
	DialogActions,
	DialogContent,
	DialogTitle,
	Divider,
	FormControl,
	FormLabel,
	Input,
	Modal,
	ModalDialog,
	Textarea,
} from '@mui/joy';
import { CreateModalsProps } from './createModalsProps';
import { useState } from 'react';
import { tabTypeIcon } from '@/constants/components';
import { addNewService } from '@/state/active/thunks/services';
import { useAppDispatch } from '@/state/store';
import { tabsActions } from '@/state/tabs/slice';

export function CreateServiceModal({ open, closeFunc }: CreateModalsProps) {
	const dispatch = useAppDispatch();
	const [serviceName, setServiceName] = useState('');
	const [serviceDescription, setServiceDescription] = useState('');
	const [baseUrl, setBaseUrl] = useState('');
	const serviceNameValid = serviceName.length > 0;
	const allFieldsValid = serviceNameValid;

	const createServiceFunction = async () => {
		const createdServiceId = await dispatch(
			addNewService({ name: serviceName, description: serviceDescription, baseUrl }),
		).unwrap();
		dispatch(tabsActions.addTabs({ [createdServiceId]: 'service' }));
		dispatch(tabsActions.setSelectedTab(createdServiceId));
	};

	return (
		<Modal
			open={open}
			onClose={() => {
				closeFunc();
			}}
		>
			<ModalDialog variant="outlined" role="alertdialog">
				<DialogTitle>
					{tabTypeIcon['service']}
					Create New Service
				</DialogTitle>
				<Divider />
				<DialogContent>
					<>
						<FormControl>
							<FormLabel>Service Name *</FormLabel>
							<Input
								value={serviceName}
								onChange={(e) => setServiceName(e.target.value)}
								error={!serviceNameValid}
								required
							/>
						</FormControl>
						<FormControl>
							<FormLabel>Service Description</FormLabel>
							<Textarea
								minRows={3}
								value={serviceDescription}
								onChange={(e) => setServiceDescription(e.target.value)}
							/>
						</FormControl>
						<FormControl>
							<FormLabel>Base Url</FormLabel>
							<Input value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} />
						</FormControl>
					</>
				</DialogContent>
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
