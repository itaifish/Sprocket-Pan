import { ListItemDecorator, ListSubheader } from '@mui/joy';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import { useSelector } from 'react-redux';
import { menuOptionDuplicate, menuOptionDelete } from './FileSystemDropdown';
import { FileSystemLeaf } from './tree/FileSystemLeaf';
import { Add, Close } from '@mui/icons-material';
import { EllipsisSpan } from '@/components/shared/EllipsisTypography';
import { selectRequestsById, selectEndpointById } from '@/state/active/selectors';
import { activeActions } from '@/state/active/slice';
import { addNewRequestFromId } from '@/state/active/thunks/requests';
import { useAppDispatch } from '@/state/store';
import { tabsActions } from '@/state/tabs/slice';
import { SyncBadge } from './SyncBadge';

interface RequestFileSystemProps {
	requestId: string;
}

export function RequestFileSystem({ requestId }: RequestFileSystemProps) {
	const request = useSelector((state) => selectRequestsById(state, requestId));
	const endpoint = useSelector((state) => selectEndpointById(state, request.endpointId));
	const isDefault = endpoint.defaultRequest === request.id;
	const isDefaultRequest = request.id === endpoint.defaultRequest;
	const dispatch = useAppDispatch();

	return (
		<FileSystemLeaf
			id={requestId}
			tabType="request"
			color={isDefaultRequest ? 'primary' : 'neutral'}
			menuOptions={[
				{
					Icon: isDefault ? Close : Add,
					label: isDefault ? 'Unset Endpoint Default' : 'Set Endpoint Default',
					onClick: () =>
						dispatch(
							activeActions.updateEndpoint({ defaultRequest: isDefault ? null : request.id, id: request.endpointId }),
						),
				},
				menuOptionDuplicate(() => dispatch(addNewRequestFromId(request.id))),
				menuOptionDelete(() => dispatch(tabsActions.addToDeleteQueue(request.id))),
			]}
		>
			<ListItemDecorator>
				<SyncBadge id={requestId}>
					<TextSnippetIcon fontSize="small" />
				</SyncBadge>
			</ListItemDecorator>
			<ListSubheader sx={{ width: '100%' }}>
				<EllipsisSpan>{request.name}</EllipsisSpan>
			</ListSubheader>
		</FileSystemLeaf>
	);
}
