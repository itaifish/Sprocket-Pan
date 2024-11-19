import { ListItem, ListItemButton, ListItemDecorator, ListSubheader } from '@mui/joy';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import { useAppDispatch } from '../../../state/store';
import { addNewRequestFromId } from '../../../state/active/thunks/requests';
import { addTabs, addToDeleteQueue, setSelectedTab } from '../../../state/tabs/slice';
import { selectEndpointById, selectRequestsById } from '../../../state/active/selectors';
import { useSelector } from 'react-redux';
import { selectIsActiveTab } from '../../../state/tabs/selectors';
import { FileSystemDropdown, menuOptionDuplicate, menuOptionDelete } from './FileSystemDropdown';
import { EllipsisSpan } from '../../shared/EllipsisTypography';

interface RequestFileSystemProps {
	requestId: string;
}

export function RequestFileSystem({ requestId }: RequestFileSystemProps) {
	const request = useSelector((state) => selectRequestsById(state, requestId));
	const endpoint = useSelector((state) => selectEndpointById(state, request.endpointId));
	const isDefaultRequest = request.id === endpoint.defaultRequest;
	const isSelected = useSelector((state) => selectIsActiveTab(state, request.id));
	const dispatch = useAppDispatch();

	return (
		<ListItem
			id={`file_${requestId}`}
			nested
			endAction={
				<FileSystemDropdown
					options={[
						menuOptionDuplicate(() => dispatch(addNewRequestFromId(request.id))),
						menuOptionDelete(() => dispatch(addToDeleteQueue(request.id))),
					]}
				/>
			}
		>
			<ListItemButton
				onClick={() => {
					dispatch(addTabs({ [request.id]: 'request' }));
					dispatch(setSelectedTab(request.id));
				}}
				color={isDefaultRequest ? 'primary' : 'neutral'}
				selected={isSelected}
			>
				<ListItemDecorator>
					<TextSnippetIcon fontSize="small" />
				</ListItemDecorator>
				<ListSubheader sx={{ width: '100%' }}>
					<EllipsisSpan>{request.name}</EllipsisSpan>
				</ListSubheader>
			</ListItemButton>
		</ListItem>
	);
}
