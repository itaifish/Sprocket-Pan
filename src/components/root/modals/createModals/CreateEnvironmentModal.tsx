import {
	Autocomplete,
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
} from '@mui/joy';
import { CreateModalsProps } from './createModalsProps';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { tabTypeIcon } from '@/constants/components';
import { selectEnvironments } from '@/state/active/selectors';
import { useAppDispatch } from '@/state/store';
import { itemActions } from '@/state/items';

export function CreateEnvironmentModal({ open, closeFunc }: CreateModalsProps) {
	const [envName, setEnvName] = useState('');
	const [cloneFrom, setCloneFrom] = useState<string | null>(null);
	const allEnvironments = useSelector(selectEnvironments);
	const cloneEnv = cloneFrom == null || allEnvironments[cloneFrom] == null ? undefined : allEnvironments[cloneFrom];
	const dispatch = useAppDispatch();
	const envNameValid = envName.length > 0;
	const allFieldsValid = envNameValid;
	const autoOptions = [
		{ label: "Don't clone", value: null },
		...Object.values(allEnvironments).map((env) => ({
			label: env.name,
			value: env.id,
		})),
	];
	return (
		<Modal open={open} onClose={closeFunc}>
			<ModalDialog variant="outlined" role="alertdialog">
				<DialogTitle>
					{tabTypeIcon['environment']}
					Create New Environment
				</DialogTitle>
				<Divider />
				<DialogContent>
					<FormControl>
						<FormLabel>Environment Name *</FormLabel>
						<Input value={envName} onChange={(e) => setEnvName(e.target.value)} error={!envNameValid} required />
					</FormControl>
					<FormControl>
						<FormLabel>Clone from existing environment?</FormLabel>
						<Autocomplete
							value={cloneEnv == null ? autoOptions[0] : { label: cloneEnv.name, value: cloneEnv.id }}
							onChange={(_e, value) => setCloneFrom(value?.value ?? null)}
							options={autoOptions}
						></Autocomplete>
					</FormControl>
				</DialogContent>
				<DialogActions>
					<Button
						variant="solid"
						color="success"
						disabled={!allFieldsValid}
						onClick={() => {
							dispatch(itemActions.environment.create(cloneEnv));
							closeFunc();
						}}
					>
						Save
					</Button>
					<Button variant="plain" color="neutral" onClick={closeFunc}>
						Cancel
					</Button>
				</DialogActions>
			</ModalDialog>
		</Modal>
	);
}
