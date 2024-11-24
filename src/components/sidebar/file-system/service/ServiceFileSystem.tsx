import { IconButton, ListItemDecorator, ListSubheader } from '@mui/joy';
import FolderOpenSharpIcon from '@mui/icons-material/FolderOpenSharp';
import FolderSharpIcon from '@mui/icons-material/FolderSharp';
import { EndpointFileSystem } from '../EndpointFileSystem';
import AddBoxIcon from '@mui/icons-material/AddBox';
import { useAppDispatch } from '../../../../state/store';
import { addNewEndpoint } from '../../../../state/active/thunks/endpoints';
import { cloneServiceFromId } from '../../../../state/active/thunks/services';
import { addToDeleteQueue } from '../../../../state/tabs/slice';
import { useSelector } from 'react-redux';
import { selectServicesById } from '../../../../state/active/selectors';
import { selectFilteredNestedIds } from '../../../../state/tabs/selectors';
import { menuOptionDuplicate, menuOptionDelete } from '../FileSystemDropdown';
import { SprocketTooltip } from '../../../shared/SprocketTooltip';
import { updateService } from '../../../../state/active/slice';
import { EllipsisSpan } from '../../../shared/EllipsisTypography';
import { FileSystemStem } from '../FileSystemEntry';

interface ServiceFileSystemProps {
	serviceId: string;
}

export function ServiceFileSystem({ serviceId }: ServiceFileSystemProps) {
	const service = useSelector((state) => selectServicesById(state, serviceId));
	const endpointIds = useSelector((state) => selectFilteredNestedIds(state, service.endpointIds));

	const dispatch = useAppDispatch();

	const collapsed = service.userInterfaceData?.fileCollapsed ?? false;
	const setCollapsed = (isCollapsed: boolean) => {
		dispatch(
			updateService({
				id: serviceId,
				userInterfaceData: { ...service.userInterfaceData, fileCollapsed: isCollapsed },
			}),
		);
	};

	return (
		<FileSystemStem
			id={serviceId}
			tabType="service"
			menuOptions={[
				menuOptionDuplicate(() => dispatch(cloneServiceFromId(service.id))),
				{
					onClick: () => dispatch(addNewEndpoint({ serviceId: service.id })),
					label: 'Add Endpoint',
					Icon: AddBoxIcon,
				},
				menuOptionDelete(() => dispatch(addToDeleteQueue(service.id))),
			]}
			buttonContent={
				<>
					<ListItemDecorator>
						<SprocketTooltip text={collapsed ? 'Expand' : 'Collapse'}>
							<IconButton
								onClick={(e) => {
									setCollapsed(!collapsed);
									e.preventDefault();
									e.stopPropagation();
								}}
							>
								{collapsed ? <FolderSharpIcon fontSize="small" /> : <FolderOpenSharpIcon fontSize="small" />}
							</IconButton>
						</SprocketTooltip>
					</ListItemDecorator>
					<ListSubheader sx={{ width: '100%' }}>
						<EllipsisSpan>{service.name}</EllipsisSpan>
					</ListSubheader>
				</>
			}
		>
			{!collapsed && endpointIds.map((endpointId) => <EndpointFileSystem endpointId={endpointId} key={endpointId} />)}
		</FileSystemStem>
	);
}
