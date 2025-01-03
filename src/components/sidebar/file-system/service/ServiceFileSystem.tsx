import { EndpointFileSystem } from '../EndpointFileSystem';
import AddBoxIcon from '@mui/icons-material/AddBox';
import { useSelector } from 'react-redux';
import { selectServiceById } from '@/state/active/selectors';
import { addNewEndpoint } from '@/state/active/thunks/endpoints';
import { addNewRequest } from '@/state/active/thunks/requests';
import { cloneServiceFromId } from '@/state/active/thunks/services';
import { useAppDispatch } from '@/state/store';
import { selectFilteredNestedIds } from '@/state/tabs/selectors';
import { tabsActions } from '@/state/tabs/slice';
import { collapseAll, expandAll } from '@/state/ui/thunks';
import { FileSystemBranch } from '../tree/FileSystemBranch';
import {
	menuOptionDuplicate,
	menuOptionCollapseAll,
	menuOptionExpandAll,
	menuOptionDelete,
} from '../tree/FileSystemDropdown';
import { EllipsesP } from '../components/EllipsesP';

interface ServiceFileSystemProps {
	serviceId: string;
}

export function ServiceFileSystem({ serviceId }: ServiceFileSystemProps) {
	const service = useSelector((state) => selectServiceById(state, serviceId));
	const endpointIds = useSelector((state) => selectFilteredNestedIds(state, service?.endpointIds ?? []));

	const dispatch = useAppDispatch();
	if (service == null) return null;

	return (
		<FileSystemBranch
			id={serviceId}
			tabType="service"
			menuOptions={[
				menuOptionDuplicate(() => dispatch(cloneServiceFromId(service.id))),
				{
					onClick: async () => {
						const newEndpoint = await dispatch(addNewEndpoint({ serviceId: service.id }));
						if (typeof newEndpoint.payload === 'string') {
							await dispatch(addNewRequest({ endpointId: newEndpoint.payload }));
						}
					},
					label: 'Add Endpoint',
					Icon: AddBoxIcon,
				},
				menuOptionCollapseAll(() => dispatch(collapseAll(service.endpointIds))),
				menuOptionExpandAll(() => dispatch(expandAll([service.id, ...service.endpointIds]))),
				menuOptionDelete(() => dispatch(tabsActions.addToDeleteQueue(service.id))),
			]}
			buttonContent={<EllipsesP>{service.name}</EllipsesP>}
		>
			{endpointIds.map((endpointId) => (
				<EndpointFileSystem endpointId={endpointId} key={endpointId} />
			))}
		</FileSystemBranch>
	);
}
