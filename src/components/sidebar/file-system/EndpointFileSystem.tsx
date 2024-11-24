import { IconButton, ListItemDecorator, ListSubheader, Chip, ListItemContent } from '@mui/joy';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import FolderIcon from '@mui/icons-material/Folder';
import { RequestFileSystem } from './RequestFileSystem';
import AddBoxIcon from '@mui/icons-material/AddBox';
import { verbColors } from '../../../utils/style';
import { useAppDispatch } from '../../../state/store';
import { addNewEndpointById } from '../../../state/active/thunks/endpoints';
import { addNewRequest } from '../../../state/active/thunks/requests';
import { addToDeleteQueue } from '../../../state/tabs/slice';
import { useSelector } from 'react-redux';
import { selectEndpointById } from '../../../state/active/selectors';
import { selectFilteredNestedIds } from '../../../state/tabs/selectors';
import { menuOptionDelete, menuOptionDuplicate } from './FileSystemDropdown';
import { SprocketTooltip } from '../../shared/SprocketTooltip';
import { updateEndpoint } from '../../../state/active/slice';
import { EllipsisTypography } from '../../shared/EllipsisTypography';
import { FileSystemStem } from './tree/FileSystemStem';

interface EndpointFileSystemProps {
	endpointId: string;
}

export function EndpointFileSystem({ endpointId }: EndpointFileSystemProps) {
	const endpoint = useSelector((state) => selectEndpointById(state, endpointId));
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
		<FileSystemStem
			id={endpointId}
			tabType="endpoint"
			menuOptions={[
				menuOptionDuplicate(() => dispatch(addNewEndpointById(endpoint.id))),
				{
					onClick: () => dispatch(addNewRequest({ endpointId: endpoint.id })),
					label: 'Add Request',
					Icon: AddBoxIcon,
				},
				menuOptionDelete(() => dispatch(addToDeleteQueue(endpoint.id))),
			]}
			buttonContent={
				<>
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
					<ListSubheader>
						<Chip size="sm" variant="outlined" color={verbColors[endpoint.verb]}>
							{endpoint.verb}
						</Chip>
					</ListSubheader>
					<ListItemContent>
						<EllipsisTypography>{endpoint.name}</EllipsisTypography>
					</ListItemContent>
				</>
			}
		>
			{!collapsed && requestIds.map((requestId) => <RequestFileSystem requestId={requestId} key={requestId} />)}
		</FileSystemStem>
	);
}
