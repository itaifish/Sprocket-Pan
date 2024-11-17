import { Box, IconButton, List, ListItem, ListItemButton, ListItemDecorator, ListSubheader } from '@mui/joy';
import FolderOpenSharpIcon from '@mui/icons-material/FolderOpenSharp';
import FolderSharpIcon from '@mui/icons-material/FolderSharp';
import { keepStringLengthReasonable } from '../../../../utils/string';
import { EndpointFileSystem } from '../EndpointFileSystem';
import AddBoxIcon from '@mui/icons-material/AddBox';
import { useAppDispatch } from '../../../../state/store';
import { addNewEndpoint } from '../../../../state/active/thunks/endpoints';
import { cloneServiceFromId } from '../../../../state/active/thunks/services';
import { addTabs, addToDeleteQueue, setSelectedTab } from '../../../../state/tabs/slice';
import { useSelector } from 'react-redux';
import { selectServicesById } from '../../../../state/active/selectors';
import { selectFilteredNestedIds, selectIsActiveTab } from '../../../../state/tabs/selectors';
import { FileSystemDropdown, menuOptionDuplicate, menuOptionDelete } from '../FileSystemDropdown';
import { SprocketTooltip } from '../../../shared/SprocketTooltip';
import { updateService } from '../../../../state/active/slice';

interface ServiceFileSystemProps {
	serviceId: string;
}

export function ServiceFileSystem({ serviceId }: ServiceFileSystemProps) {
	const service = useSelector((state) => selectServicesById(state, serviceId));
	const endpointIds = useSelector((state) => selectFilteredNestedIds(state, service.endpointIds));
	const isSelected = useSelector((state) => selectIsActiveTab(state, service.id));

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
		<>
			<Box id={`file_${serviceId}`}></Box>
			<ListItem
				nested
				endAction={
					<FileSystemDropdown
						options={[
							menuOptionDuplicate(() => dispatch(cloneServiceFromId(service.id))),
							{
								onClick: () => dispatch(addNewEndpoint({ serviceId: service.id })),
								label: 'Add Endpoint',
								Icon: AddBoxIcon,
							},
							menuOptionDelete(() => dispatch(addToDeleteQueue(service.id))),
						]}
					/>
				}
			>
				<ListItemButton
					onClick={() => {
						dispatch(addTabs({ [service.id]: 'service' }));
						dispatch(setSelectedTab(service.id));
					}}
					selected={isSelected}
				>
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
					<ListSubheader>{keepStringLengthReasonable(service.name)}</ListSubheader>
				</ListItemButton>
				<List
					aria-labelledby="nav-list-browse"
					sx={{
						'& .JoyListItemButton-root': { p: '8px' },
						'--List-nestedInsetStart': '1rem',
					}}
				>
					{!collapsed &&
						endpointIds.map((endpointId) => <EndpointFileSystem endpointId={endpointId} key={endpointId} />)}
				</List>
			</ListItem>
		</>
	);
}
