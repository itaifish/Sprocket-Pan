import {
	Button,
	CircularProgress,
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
	Stack,
} from '@mui/joy';
import { useState } from 'react';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { useAppDispatch } from '../../state/store';
import { toValidFolderName } from '../../utils/string';
import { createWorkspace } from '../../state/global/thunks';
import { useSelector } from 'react-redux';
import { selectWorkspacesList } from '../../state/global/selectors';

interface CreateNewWorkspaceModalProps {
	open: boolean;
	closeFunc: () => void;
}

export function CreateNewWorkspaceModal({ open, closeFunc }: CreateNewWorkspaceModalProps) {
	const workspaces = useSelector(selectWorkspacesList);
	const [workspaceName, setWorkspaceName] = useState('');
	const [workspaceDescription, setWorkspaceDescription] = useState('');
	const [loading, setLoading] = useState(false);
	const dispatch = useAppDispatch();
	const workspaceFileName = toValidFolderName(workspaceName).substring(0, 25);
	const isEmpty = workspaceFileName === '';
	const alreadyExists = workspaces.some((workspace) => workspace.fileName === workspaceFileName);

	const reset = () => {
		setWorkspaceDescription('');
		setWorkspaceName('');
		setLoading(false);
	};

	const onClose = () => {
		reset();
		closeFunc();
	};

	async function onCreate() {
		setLoading(true);
		await dispatch(
			createWorkspace({
				name: workspaceName,
				description: workspaceDescription,
				lastModified: new Date().getTime(),
				fileName: workspaceFileName,
			}),
		).unwrap();
		onClose();
	}

	return (
		<Modal open={open} onClose={onClose}>
			<ModalDialog variant="outlined" role="alertdialog">
				<DialogTitle>Create a New Workspace</DialogTitle>
				<Divider />
				<DialogContent sx={{ minWidth: '500px' }}>
					<Stack gap={2}>
						<FormControl>
							<FormLabel>Name</FormLabel>
							<Input
								placeholder="New Workspace Name"
								value={workspaceName}
								onChange={(e) => setWorkspaceName(e.target.value)}
								error={alreadyExists}
							/>
							{!isEmpty && (
								<FormHelperText>
									This will be saved in the <code>{workspaceFileName}</code> folder.
								</FormHelperText>
							)}
							{alreadyExists && <FormHelperText>A workspace this folder name already exists.</FormHelperText>}
						</FormControl>
						<FormControl>
							<FormLabel>Short Description</FormLabel>
							<Input
								placeholder="New Workspace Description"
								value={workspaceDescription}
								onChange={(e) => setWorkspaceDescription(e.target.value)}
							/>
						</FormControl>
					</Stack>
				</DialogContent>
				<DialogActions>
					<Button
						variant="solid"
						color="primary"
						onClick={onCreate}
						startDecorator={loading ? <CircularProgress /> : <AddCircleIcon />}
						disabled={loading || isEmpty || alreadyExists}
					>
						Create
					</Button>
					<Button variant="plain" color="danger" onClick={onClose} disabled={loading}>
						Cancel
					</Button>
				</DialogActions>
			</ModalDialog>
		</Modal>
	);
}
