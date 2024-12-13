import { ListSubheader } from '@mui/joy';
import { EndpointFileSystem } from '../EndpointFileSystem';
import AddBoxIcon from '@mui/icons-material/AddBox';
import { useSelector } from 'react-redux';

import {
	menuOptionDuplicate,
	menuOptionDelete,
	menuOptionCollapseAll,
	menuOptionExpandAll,
} from '../FileSystemDropdown';
import { EllipsisSpan } from '@/components/shared/EllipsisTypography';
import { selectServicesById } from '@/state/active/selectors';
import { addNewEndpoint } from '@/state/active/thunks/endpoints';
import { addNewRequest } from '@/state/active/thunks/requests';
import { cloneServiceFromId } from '@/state/active/thunks/services';
import { useAppDispatch } from '@/state/store';
import { selectFilteredNestedIds } from '@/state/tabs/selectors';
import { tabsActions } from '@/state/tabs/slice';
import { collapseAll, expandAll } from '@/state/ui/thunks';
import { FileSystemBranch } from '../tree/FileSystemBranch';

interface ServiceFileSystemProps {
	serviceId: string;
}

export function ServiceFileSystem({ serviceId }: ServiceFileSystemProps) {
	const service = useSelector((state) => selectServicesById(state, serviceId));
	const endpointIds = useSelector((state) => selectFilteredNestedIds(state, service.endpointIds));

	const dispatch = useAppDispatch();

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
			buttonContent={
				<ListSubheader sx={{ ml: '1px', width: '100%' }}>
					<EllipsisSpan>{service.name}</EllipsisSpan>
				</ListSubheader>
			}
		>
			{endpointIds.map((endpointId) => (
				<EndpointFileSystem endpointId={endpointId} key={endpointId} />
			))}
		</FileSystemBranch>
	);
}
