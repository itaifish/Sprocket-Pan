import TableChartIcon from '@mui/icons-material/TableChart';
import { useSelector } from 'react-redux';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import { EllipsisSpan } from '@/components/shared/EllipsisTypography';
import { selectSelectedEnvironment, selectEnvironmentsById } from '@/state/active/selectors';
import { activeActions } from '@/state/active/slice';
import { addNewEnvironmentById } from '@/state/active/thunks/environments';
import { useAppDispatch } from '@/state/store';
import { tabsActions } from '@/state/tabs/slice';
import { menuOptionDuplicate, menuOptionDelete } from '../tree/FileSystemDropdown';
import { FileSystemLeaf } from '../tree/FileSystemLeaf';
import { SyncBadge } from '../components/SyncBadge';

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
			menuOptions={[
				{
					onClick: () => dispatch(activeActions.selectEnvironment(envSelected ? undefined : environment.id)),
					Icon: CheckCircleOutlinedIcon,
					label: envSelected ? 'Deselect' : 'Select',
				},
				menuOptionDuplicate(() => dispatch(addNewEnvironmentById(environment.id))),
				menuOptionDelete(() => dispatch(tabsActions.addToDeleteQueue(environment.id))),
			]}
		>
			<SyncBadge id={environmentId}>
				<TableChartIcon fontSize="small" />
			</SyncBadge>
			<EllipsisSpan>{environment.name}</EllipsisSpan>
		</FileSystemLeaf>
	);
}
