import { RequestFileSystem } from './RequestFileSystem';
import AddBoxIcon from '@mui/icons-material/AddBox';
import { useSelector } from 'react-redux';
import { menuOptionDelete, menuOptionDuplicate } from './tree/FileSystemDropdown';
import { FileSystemBranch } from './tree/FileSystemBranch';
import { selectEndpointById } from '@/state/active/selectors';
import { addNewEndpointById } from '@/state/active/thunks/endpoints';
import { addNewRequest } from '@/state/active/thunks/requests';
import { useAppDispatch } from '@/state/store';
import { selectFilteredNestedIds } from '@/state/ui/selectors';
import { uiActions } from '@/state/ui/slice';
import { VerbDiv } from './components/VerbDiv';
import { EllipsesP } from './components/EllipsesP';

interface EndpointFileSystemProps {
	endpointId: string;
}

export function EndpointFileSystem({ endpointId }: EndpointFileSystemProps) {
	const endpoint = useSelector((state) => selectEndpointById(state, endpointId));
	const requestIds = useSelector((state) => selectFilteredNestedIds(state, endpoint?.requestIds ?? []));
	const dispatch = useAppDispatch();

	if (endpoint == null) return null;

	return (
		<FileSystemBranch
			id={endpointId}
			tabType="endpoint"
			menuOptions={[
				menuOptionDuplicate(() => dispatch(addNewEndpointById(endpoint.id))),
				{
					onClick: () => dispatch(addNewRequest({ endpointId: endpoint.id })),
					label: 'Add Request',
					Icon: AddBoxIcon,
				},
				menuOptionDelete(() => dispatch(uiActions.addToDeleteQueue(endpoint.id))),
			]}
			buttonContent={
				<>
					<VerbDiv verb={endpoint.verb} />
					<EllipsesP>{endpoint.name}</EllipsesP>
				</>
			}
		>
			{requestIds.map((requestId) => (
				<RequestFileSystem requestId={requestId} key={requestId} />
			))}
		</FileSystemBranch>
	);
}
