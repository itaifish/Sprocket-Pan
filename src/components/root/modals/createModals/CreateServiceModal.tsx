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
import { iconFromTabType, Service } from '../../../../types/application-data/application-data';
import { useState } from 'react';
import { useAppDispatch } from '../../../../state/store';
import { cloneService } from '../../../../state/active/thunks/services';
import { tabsActions } from '../../../../state/tabs/slice';

export function CreateServiceModal({ open, closeFunc }: CreateModalsProps) {
	const dispatch = useAppDispatch();
	const [serviceName, setServiceName] = useState('');
	const [serviceDescription, setServiceDescription] = useState('');
	const [baseUrl, setBaseUrl] = useState('');
	const serviceNameValid = serviceName.length > 0;
	const allFieldsValid = serviceNameValid;

	const createServiceFunction = async () => {
		const newService: Partial<Service> = { name: serviceName };
		if (serviceDescription) {
			newService.description = serviceDescription;
		}
		if (baseUrl) {
			newService.baseUrl = baseUrl;
		}
		const createdServiceId = await dispatch(cloneService({ data: newService })).unwrap();
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
					{iconFromTabType['service']}
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
