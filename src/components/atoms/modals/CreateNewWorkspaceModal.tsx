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
import { useState } from 'react';
import { fileSystemManager } from '../../../managers/FileSystemManager';
import { isValidFolderName } from '../../../utils/string';

interface CreateNewWorkspaceModalProps {
	open: boolean;
	closeFunc: () => void;
}

export function CreateNewWorkspaceModal(props: CreateNewWorkspaceModalProps) {
	const { open, closeFunc } = props;
	const [workspaceName, setWorkspaceName] = useState('');
	const [workspaceDescription, setWorkspaceDescription] = useState('A SprocketPan Workspace');
	const [loading, setLoading] = useState(false);
	return (
		<Modal open={open} onClose={() => closeFunc()}>
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
							error={!isValidFolderName(workspaceName)}
						></Input>
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
					<Button variant="plain" color="danger" onClick={() => closeFunc()}>
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
							});
							setWorkspaceDescription('A SprocketPan Workspace');
							setWorkspaceName('');
							closeFunc();
						}}
					>
						Save
					</Button>
				</DialogActions>
			</ModalDialog>
		</Modal>
	);
}
