import { ListSubheader, Chip, ListItemContent } from '@mui/joy';
import { RequestFileSystem } from './RequestFileSystem';
import AddBoxIcon from '@mui/icons-material/AddBox';
import { useSelector } from 'react-redux';
import { menuOptionDelete, menuOptionDuplicate } from './FileSystemDropdown';
import { FileSystemBranch } from './tree/FileSystemBranch';
import { EllipsisTypography } from '@/components/shared/EllipsisTypography';
import { verbColors } from '@/constants/style';
import { selectEndpointById } from '@/state/active/selectors';
import { addNewEndpointById } from '@/state/active/thunks/endpoints';
import { addNewRequest } from '@/state/active/thunks/requests';
import { useAppDispatch } from '@/state/store';
import { selectFilteredNestedIds } from '@/state/tabs/selectors';
import { tabsActions } from '@/state/tabs/slice';

interface EndpointFileSystemProps {
	endpointId: string;
}

export function EndpointFileSystem({ endpointId }: EndpointFileSystemProps) {
	const endpoint = useSelector((state) => selectEndpointById(state, endpointId));
	const requestIds = useSelector((state) => selectFilteredNestedIds(state, endpoint.requestIds));

	const dispatch = useAppDispatch();

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
				menuOptionDelete(() => dispatch(tabsActions.addToDeleteQueue(endpoint.id))),
			]}
			folderSize="sm"
			buttonContent={
				<>
					<ListSubheader>
						<Chip size="sm" variant="outlined" color={verbColors[endpoint.verb]}>
							{endpoint.verb}
						</Chip>
					</ListSubheader>
					<ListItemContent>
						<EllipsisTypography fontSize="sm">{endpoint.name}</EllipsisTypography>
					</ListItemContent>
				</>
			}
		>
			{requestIds.map((requestId) => (
				<RequestFileSystem requestId={requestId} key={requestId} />
			))}
		</FileSystemBranch>
	);
}
