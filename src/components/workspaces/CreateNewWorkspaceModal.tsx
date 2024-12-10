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
	Textarea,
} from '@mui/joy';
import { useState } from 'react';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { useAppDispatch } from '../../state/store';
import { toValidFolderName } from '../../utils/string';
import { createWorkspace } from '../../state/global/thunks';

interface CreateNewWorkspaceModalProps {
	open: boolean;
	closeFunc: () => void;
}

export function CreateNewWorkspaceModal(props: CreateNewWorkspaceModalProps) {
	const { open, closeFunc } = props;
	const [workspaceName, setWorkspaceName] = useState('');
	const [workspaceDescription, setWorkspaceDescription] = useState('A SprocketPan Workspace');
	const [loading, setLoading] = useState(false);
	const dispatch = useAppDispatch();
	const workspaceFileName = toValidFolderName(workspaceName);
	const isError = workspaceFileName.length > 25 || workspaceFileName.length == 0;

	const reset = () => {
		setWorkspaceDescription('A SprocketPan Workspace');
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
					<FormControl>
						<FormLabel>Name</FormLabel>
						<Input
							placeholder="New Workspace Name"
							value={workspaceName}
							onChange={(e) => setWorkspaceName(e.target.value)}
							error={isError}
						></Input>
						{!isError && (
							<FormHelperText>This will be saved in the &quot;{workspaceFileName}&quot; folder</FormHelperText>
						)}
					</FormControl>
					<FormControl>
						<FormLabel>Description</FormLabel>
						<Textarea
							placeholder="New Workspace Description"
							value={workspaceDescription}
							onChange={(e) => setWorkspaceDescription(e.target.value)}
						></Textarea>
					</FormControl>
				</DialogContent>
				<DialogActions>
					<Button variant="plain" color="danger" onClick={onClose} disabled={loading}>
						Cancel
					</Button>
					<Button
						variant="solid"
						color="primary"
						onClick={onCreate}
						startDecorator={loading ? <CircularProgress /> : <AddCircleIcon />}
						disabled={loading || isError}
					>
						Create
					</Button>
				</DialogActions>
			</ModalDialog>
		</Modal>
	);
}
