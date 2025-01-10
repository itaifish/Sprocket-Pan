import { EndpointFileSystem } from '../EndpointFileSystem';
import AddBoxIcon from '@mui/icons-material/AddBox';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '@/state/store';
import { selectFilteredNestedIds } from '@/state/ui/selectors';
import { uiActions } from '@/state/ui/slice';
import { collapseAll, expandAll } from '@/state/ui/thunks';
import { FileSystemBranch } from '../tree/FileSystemBranch';
import {
	menuOptionDuplicate,
	menuOptionCollapseAll,
	menuOptionExpandAll,
	menuOptionDelete,
} from '../tree/FileSystemDropdown';
import { EllipsesP } from '../components/EllipsesP';
import { itemActions } from '@/state/items';

interface ServiceFileSystemProps {
	serviceId: string;
}

export function ServiceFileSystem({ serviceId }: ServiceFileSystemProps) {
	const service = useSelector((state) => itemActions.service.select(state, serviceId));
	const endpointIds = useSelector((state) => selectFilteredNestedIds(state, service?.endpointIds ?? []));

	const dispatch = useAppDispatch();
	if (service == null) return null;

	return (
		<FileSystemBranch
			id={serviceId}
			menuOptions={[
				menuOptionDuplicate(() => dispatch(itemActions.service.duplicate(service))),
				{
					onClick: () => dispatch(itemActions.endpoint.create({ serviceId: service.id })),
					label: 'Add Endpoint',
					Icon: AddBoxIcon,
				},
				menuOptionCollapseAll(() => dispatch(collapseAll(service.endpointIds))),
				menuOptionExpandAll(() => dispatch(expandAll([service.id, ...service.endpointIds]))),
				menuOptionDelete(() => dispatch(uiActions.addToDeleteQueue(service.id))),
			]}
			buttonContent={<EllipsesP>{service.name}</EllipsesP>}
		>
			{endpointIds.map((endpointId) => (
				<EndpointFileSystem endpointId={endpointId} key={endpointId} />
			))}
		</FileSystemBranch>
	);
}
