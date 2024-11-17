import {
	IconButton,
	List,
	ListItem,
	ListItemButton,
	ListItemDecorator,
	ListSubheader,
	Chip,
	ListItemContent,
	Box,
} from '@mui/joy';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import FolderIcon from '@mui/icons-material/Folder';
import { RequestFileSystem } from './RequestFileSystem';
import AddBoxIcon from '@mui/icons-material/AddBox';
import { keepStringLengthReasonable } from '../../../utils/string';
import { verbColors } from '../../../utils/style';
import { useAppDispatch } from '../../../state/store';
import { addNewEndpointById } from '../../../state/active/thunks/endpoints';
import { addNewRequest } from '../../../state/active/thunks/requests';
import { addTabs, addToDeleteQueue, setSelectedTab } from '../../../state/tabs/slice';
import { useSelector } from 'react-redux';
import { selectEndpointById } from '../../../state/active/selectors';
import { selectFilteredNestedIds, selectIsActiveTab } from '../../../state/tabs/selectors';
import { FileSystemDropdown, menuOptionDelete, menuOptionDuplicate } from './FileSystemDropdown';
import { SprocketTooltip } from '../../shared/SprocketTooltip';
import { updateEndpoint } from '../../../state/active/slice';

interface EndpointFileSystemProps {
	endpointId: string;
}

export function EndpointFileSystem({ endpointId }: EndpointFileSystemProps) {
	const endpoint = useSelector((state) => selectEndpointById(state, endpointId));
	const isSelected = useSelector((state) => selectIsActiveTab(state, endpointId));
	const requestIds = useSelector((state) => selectFilteredNestedIds(state, endpoint.requestIds));

	const dispatch = useAppDispatch();

	const collapsed = endpoint.userInterfaceData?.fileCollapsed ?? false;
	const setCollapsed = (isCollapsed: boolean) => {
		dispatch(
			updateEndpoint({
				id: endpointId,
				userInterfaceData: { ...endpoint.userInterfaceData, fileCollapsed: isCollapsed },
			}),
		);
	};

	return (
		<>
			<Box id={`file_${endpointId}`}></Box>
			<ListItem
				nested
				endAction={
					<FileSystemDropdown
						options={[
							menuOptionDuplicate(() => dispatch(addNewEndpointById(endpoint.id))),
							{
								onClick: () => dispatch(addNewRequest({ endpointId: endpoint.id })),
								label: 'Add Request',
								Icon: AddBoxIcon,
							},
							menuOptionDelete(() => dispatch(addToDeleteQueue(endpoint.id))),
						]}
					/>
				}
			>
				<ListItemButton
					onClick={() => {
						dispatch(addTabs({ [endpoint.id]: 'endpoint' }));
						dispatch(setSelectedTab(endpoint.id));
					}}
					selected={isSelected}
				>
					<ListItemDecorator>
						<SprocketTooltip text={collapsed ? 'Expand' : 'Collapse'}>
							<IconButton
								size="sm"
								onClick={(e) => {
									setCollapsed(!collapsed);
									e.preventDefault();
									e.stopPropagation();
								}}
							>
								{collapsed ? <FolderIcon fontSize="small" /> : <FolderOpenIcon fontSize="small" />}
							</IconButton>
						</SprocketTooltip>
					</ListItemDecorator>
					<ListItemContent>{keepStringLengthReasonable(endpoint.name)}</ListItemContent>
					<ListSubheader>
						<Chip size="sm" variant="outlined" color={verbColors[endpoint.verb]}>
							{endpoint.verb}
						</Chip>
					</ListSubheader>
				</ListItemButton>
				<List
					aria-labelledby="nav-list-browse"
					sx={{
						'& .JoyListItemButton-root': { p: '8px' },
						'--List-nestedInsetStart': '1rem',
					}}
				>
					{!collapsed && requestIds.map((requestId) => <RequestFileSystem requestId={requestId} key={requestId} />)}
				</List>
			</ListItem>
		</>
	);
}
