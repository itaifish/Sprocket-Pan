import { ListItemDecorator, ListSubheader } from '@mui/joy';
import TableChartIcon from '@mui/icons-material/TableChart';
import { useSelector } from 'react-redux';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import { selectSelectedEnvironment, selectEnvironmentsById } from '../../../../state/active/selectors';
import { selectEnvironment } from '../../../../state/active/slice';
import { addNewEnvironmentById } from '../../../../state/active/thunks/environments';
import { useAppDispatch } from '../../../../state/store';
import { menuOptionDuplicate, menuOptionDelete } from '../FileSystemDropdown';
import { EllipsisSpan } from '../../../shared/EllipsisTypography';
import { FileSystemLeaf } from '../tree/FileSystemLeaf';
import { tabsActions } from '../../../../state/tabs/slice';

interface EnvironmentFileSystemProps {
	environmentId: string;
}

export function EnvironmentFileSystem({ environmentId }: EnvironmentFileSystemProps) {
	const selectedEnvironment = useSelector(selectSelectedEnvironment);
	const envSelected = selectedEnvironment === environmentId;
	const environment = useSelector((state) => selectEnvironmentsById(state, environmentId));
	const dispatch = useAppDispatch();
	return (
		<FileSystemLeaf
			id={environmentId}
			tabType="environment"
			color={envSelected ? 'success' : 'neutral'}
			menuOptions={[
				{
					onClick: () => dispatch(selectEnvironment(envSelected ? undefined : environment.__id)),
					Icon: CheckCircleOutlinedIcon,
					label: envSelected ? 'Deselect' : 'Select',
				},
				menuOptionDuplicate(() => dispatch(addNewEnvironmentById(environment.__id))),
				menuOptionDelete(() => dispatch(tabsActions.addToDeleteQueue(environment.__id))),
			]}
		>
			<ListItemDecorator>
				<TableChartIcon fontSize="small" />
			</ListItemDecorator>
			<ListSubheader sx={{ width: '100%' }}>
				<EllipsisSpan>{environment.__name}</EllipsisSpan>
			</ListSubheader>
		</FileSystemLeaf>
	);
}
