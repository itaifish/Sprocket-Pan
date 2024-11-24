import { ListSubheader, Chip, ListItemContent } from '@mui/joy';
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
import { EllipsisTypography } from '../../shared/EllipsisTypography';
import { FileSystemBranch } from './tree/FileSystemBranch';

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
				menuOptionDelete(() => dispatch(addToDeleteQueue(endpoint.id))),
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
						<EllipsisTypography>{endpoint.name}</EllipsisTypography>
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
