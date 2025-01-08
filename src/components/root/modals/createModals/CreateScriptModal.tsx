import {
	Button,
	DialogActions,
	DialogContent,
	DialogTitle,
	Divider,
	FormControl,
	FormHelperText,
	FormLabel,
	Input,
	Modal,
	ModalDialog,
} from '@mui/joy';
import { CreateModalsProps } from './createModalsProps';
import { useEffect, useState } from 'react';
import { InfoOutlined } from '@mui/icons-material';
import { tabTypeIcon } from '@/constants/components';
import { useAppDispatch } from '@/state/store';
import { toValidFunctionName } from '@/utils/string';
import { itemActions } from '@/state/items';

export function CreateScriptModal({ open, closeFunc }: CreateModalsProps) {
	const [scriptName, setScriptName] = useState('');
	const [scriptCallingName, setScriptCallingName] = useState('');
	const dispatch = useAppDispatch();
	const scriptCallingNameValid =
		scriptCallingName.length > 0 && toValidFunctionName(scriptCallingName) === scriptCallingName;
	const scriptNameValid = scriptName.length > 0;
	const allFieldsValid = scriptNameValid && scriptCallingNameValid;

	useEffect(() => {
		setScriptCallingName(toValidFunctionName(scriptName));
	}, [scriptName]);

	return (
		<Modal
			open={open}
			onClose={() => {
				closeFunc();
			}}
		>
			<ModalDialog variant="outlined" role="alertdialog">
				<DialogTitle>
					{tabTypeIcon['script']}
					Create New Script
				</DialogTitle>
				<Divider />
				<DialogContent>
					<FormControl>
						<FormLabel>Script Name *</FormLabel>
						<Input
							value={scriptName}
							onChange={(e) => setScriptName(e.target.value)}
							error={!scriptNameValid}
							required
						/>
					</FormControl>
					<FormControl sx={{ maxWidth: '500px' }}>
						<FormLabel>Script Function Name *</FormLabel>
						<Input
							value={scriptCallingName}
							onChange={(e) => setScriptCallingName(e.target.value)}
							error={!scriptCallingNameValid}
							required
						/>
						<FormHelperText>
							<InfoOutlined color="primary" />
							This is the name that will be called when you reference the script programmatically, in other scripts
						</FormHelperText>
					</FormControl>
				</DialogContent>
				<DialogActions>
					<Button
						variant="solid"
						color="success"
						disabled={!allFieldsValid}
						onClick={() => {
							dispatch(itemActions.script.create({ name: scriptName, scriptCallableName: scriptCallingName }));
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
