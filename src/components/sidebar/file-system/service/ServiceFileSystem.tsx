import { ListSubheader } from '@mui/joy';
import { EndpointFileSystem } from '../EndpointFileSystem';
import AddBoxIcon from '@mui/icons-material/AddBox';
import { useAppDispatch } from '../../../../state/store';
import { addNewEndpoint } from '../../../../state/active/thunks/endpoints';
import { cloneServiceFromId } from '../../../../state/active/thunks/services';
import { useSelector } from 'react-redux';
import { selectServicesById } from '../../../../state/active/selectors';
import { selectFilteredNestedIds } from '../../../../state/tabs/selectors';
import {
	menuOptionDuplicate,
	menuOptionDelete,
	menuOptionCollapseAll,
	menuOptionExpandAll,
} from '../FileSystemDropdown';
import { EllipsisSpan } from '../../../shared/EllipsisTypography';
import { FileSystemBranch } from '../tree/FileSystemBranch';
import { addNewRequest } from '../../../../state/active/thunks/requests';
import { collapseAll, expandAll } from '../../../../state/ui/thunks';
import { tabsActions } from '../../../../state/tabs/slice';

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
