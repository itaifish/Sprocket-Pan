import { ListItem, ListItemButton, ListItemDecorator, ListSubheader } from '@mui/joy';
import { keepStringLengthReasonable } from '../../../utils/string';
import TableChartIcon from '@mui/icons-material/TableChart';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../../../state/store';
import { addNewEnvironmentById } from '../../../state/active/thunks/environments';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import { selectEnvironment } from '../../../state/active/slice';
import { addTabs, addToDeleteQueue, setSelectedTab } from '../../../state/tabs/slice';
import { selectEnvironmentsById, selectSelectedEnvironment } from '../../../state/active/selectors';
import { selectIsActiveTab } from '../../../state/tabs/selectors';
import { FileSystemDropdown, menuOptionDelete, menuOptionDuplicate } from './FileSystemDropdown';

interface EnvironmentFileSystemProps {
	environmentId: string;
}

export function EnvironmentFileSystem({ environmentId }: EnvironmentFileSystemProps) {
	const selectedEnvironment = useSelector(selectSelectedEnvironment);
	const envSelected = selectedEnvironment === environmentId;
	const isSelected = useSelector((state) => selectIsActiveTab(state, environmentId));
	const environment = useSelector((state) => selectEnvironmentsById(state, environmentId));
	const dispatch = useAppDispatch();
	return (
		<ListItem
			nested
			endAction={
				<FileSystemDropdown
					options={[
						{
							onClick: () => dispatch(selectEnvironment(envSelected ? undefined : environment.__id)),
							Icon: CheckCircleOutlinedIcon,
							label: envSelected ? 'Deselect' : 'Select',
						},
						menuOptionDuplicate(() => dispatch(addNewEnvironmentById(environment.__id))),
						menuOptionDelete(() => dispatch(addToDeleteQueue(environment.__id))),
					]}
				/>
			}
		>
			<ListItemButton
				onClick={() => {
					dispatch(addTabs({ [environment.__id]: 'environment' }));
					dispatch(setSelectedTab(environment.__id));
				}}
				color={envSelected ? 'success' : 'neutral'}
				selected={isSelected}
			>
				<ListItemDecorator>
					<TableChartIcon fontSize="small" />
				</ListItemDecorator>
				<ListSubheader>{keepStringLengthReasonable(environment.__name)}</ListSubheader>
			</ListItemButton>
		</ListItem>
	);
}
