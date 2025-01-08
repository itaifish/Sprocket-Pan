import { RequestFileSystem } from './RequestFileSystem';
import AddBoxIcon from '@mui/icons-material/AddBox';
import { useSelector } from 'react-redux';
import { menuOptionDelete, menuOptionDuplicate } from './tree/FileSystemDropdown';
import { FileSystemBranch } from './tree/FileSystemBranch';
import { useAppDispatch } from '@/state/store';
import { selectFilteredNestedIds } from '@/state/ui/selectors';
import { uiActions } from '@/state/ui/slice';
import { VerbDiv } from './components/VerbDiv';
import { EllipsesP } from './components/EllipsesP';
import { itemActions } from '@/state/items';

interface EndpointFileSystemProps {
	endpointId: string;
}

export function EndpointFileSystem({ endpointId }: EndpointFileSystemProps) {
	const endpoint = useSelector((state) => itemActions.endpoint.select(state, endpointId));
	const requestIds = useSelector((state) => selectFilteredNestedIds(state, endpoint?.requestIds ?? []));
	const dispatch = useAppDispatch();

	if (endpoint == null) return null;

	return (
		<FileSystemBranch
			id={endpointId}
			tabType="endpoint"
			menuOptions={[
				menuOptionDuplicate(() => dispatch(itemActions.endpoint.create(endpoint))),
				{
					onClick: () => dispatch(itemActions.request.create({ endpointId: endpoint.id })),
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
