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
import { useEffect, useState } from 'react';
import { fileSystemManager } from '../../../managers/FileSystemManager';
import { toValidFolderName } from '../../../utils/string';
import AddCircleIcon from '@mui/icons-material/AddCircle';
interface CreateNewWorkspaceModalProps {
	open: boolean;
	closeFunc: () => void;
}

export function CreateNewWorkspaceModal(props: CreateNewWorkspaceModalProps) {
	const { open, closeFunc } = props;
	const [workspaceName, setWorkspaceName] = useState('');
	const [workspaceFileName, setWorkspaceFileName] = useState('');
	const [workspaceDescription, setWorkspaceDescription] = useState('A SprocketPan Workspace');
	const [loading, setLoading] = useState(false);
	const [isError, setError] = useState(true);
	useEffect(() => {
		setWorkspaceFileName(toValidFolderName(workspaceName));
	}, [workspaceName]);
	useEffect(() => {
		setError(workspaceFileName.length > 25 || workspaceFileName.length == 0);
	}, [workspaceFileName]);

	const reset = () => {
		setWorkspaceDescription('A SprocketPan Workspace');
		setWorkspaceName('');
		setWorkspaceFileName('');
		setLoading(false);
	};
	const onClose = () => {
		reset();
		closeFunc();
	};
	return (
		<Modal
			open={open}
			onClose={() => {
				onClose();
			}}
		>
			<ModalDialog variant="outlined" role="alertdialog">
				<DialogTitle>Create a new workspace</DialogTitle>
				<Divider />
				<DialogContent>
					<FormControl>
						<FormLabel>Workspace Name</FormLabel>
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
						<FormLabel>Workspace Description</FormLabel>
						<Textarea
							placeholder="New Workspace Description"
							value={workspaceDescription}
							onChange={(e) => setWorkspaceDescription(e.target.value)}
						></Textarea>
					</FormControl>
				</DialogContent>
				<DialogActions>
					<Button variant="plain" color="danger" onClick={() => onClose()} disabled={loading}>
						Cancel
					</Button>
					<Button
						variant="solid"
						color="primary"
						onClick={async () => {
							setLoading(true);
							await fileSystemManager.createWorkspace({
								name: workspaceName,
								description: workspaceDescription,
								lastModified: new Date(),
								fileName: workspaceFileName,
							});
							onClose();
						}}
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
