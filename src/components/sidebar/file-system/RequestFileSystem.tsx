import { useSelector } from 'react-redux';
import { menuOptionDuplicate, menuOptionDelete } from './tree/FileSystemDropdown';
import { FileSystemLeaf } from './tree/FileSystemLeaf';
import { Add, Close } from '@mui/icons-material';
import { selectRequestById, selectEndpointById } from '@/state/active/selectors';
import { activeActions } from '@/state/active/slice';
import { addNewRequestFromId } from '@/state/active/thunks/requests';
import { useAppDispatch } from '@/state/store';
import { uiActions } from '@/state/ui/slice';
import { EllipsesP } from './components/EllipsesP';
import { FluentSnippetSvg } from '@/assets/icons/fluent/FluentSnippet';
import { FluentSnippetLinkSvg } from '@/assets/icons/fluent/FluentSnippetLink';
import { useShowSync } from '@/hooks/useShowSync';

interface RequestFileSystemProps {
	requestId: string;
}

export function RequestFileSystem({ requestId }: RequestFileSystemProps) {
	const showSync = useShowSync(requestId);
	const request = useSelector((state) => selectRequestById(state, requestId));
	const endpoint = useSelector((state) => selectEndpointById(state, request?.endpointId));
	const dispatch = useAppDispatch();

	if (request == null) return null;

	const isDefault = endpoint?.defaultRequest === request.id;
	return (
		<FileSystemLeaf
			id={requestId}
			tabType="request"
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
				menuOptionDelete(() => dispatch(uiActions.addToDeleteQueue(request.id))),
			]}
		>
			<div style={{ flex: 0 }}>{showSync ? <FluentSnippetLinkSvg /> : <FluentSnippetSvg />}</div>
			<EllipsesP>{request.name}</EllipsesP>
		</FileSystemLeaf>
	);
}
