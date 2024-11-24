import { ListItemDecorator, ListSubheader } from '@mui/joy';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import { useAppDispatch } from '../../../state/store';
import { addNewRequestFromId } from '../../../state/active/thunks/requests';
import { addToDeleteQueue } from '../../../state/tabs/slice';
import { selectEndpointById, selectRequestsById } from '../../../state/active/selectors';
import { useSelector } from 'react-redux';
import { menuOptionDuplicate, menuOptionDelete } from './FileSystemDropdown';
import { EllipsisSpan } from '../../shared/EllipsisTypography';
import { FileSystemLeaf } from './tree/FileSystemLeaf';

interface RequestFileSystemProps {
	requestId: string;
}

export function RequestFileSystem({ requestId }: RequestFileSystemProps) {
	const request = useSelector((state) => selectRequestsById(state, requestId));
	const endpoint = useSelector((state) => selectEndpointById(state, request.endpointId));
	const isDefaultRequest = request.id === endpoint.defaultRequest;
	const dispatch = useAppDispatch();

	return (
		<FileSystemLeaf
			id={requestId}
			tabType="request"
			color={isDefaultRequest ? 'primary' : 'neutral'}
			menuOptions={[
				menuOptionDuplicate(() => dispatch(addNewRequestFromId(request.id))),
				menuOptionDelete(() => dispatch(addToDeleteQueue(request.id))),
			]}
		>
			<ListItemDecorator>
				<TextSnippetIcon fontSize="small" />
			</ListItemDecorator>
			<ListSubheader sx={{ width: '100%' }}>
				<EllipsisSpan>{request.name}</EllipsisSpan>
			</ListSubheader>
		</FileSystemLeaf>
	);
}
