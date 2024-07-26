import { ListItem, ListItemButton, ListItemDecorator, ListSubheader } from '@mui/joy';
import TableChartIcon from '@mui/icons-material/TableChart';
import { useSelector } from 'react-redux';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import { selectSelectedEnvironment, selectEnvironmentsById } from '../../../../state/active/selectors';
import { selectEnvironment } from '../../../../state/active/slice';
import { addNewEnvironmentById } from '../../../../state/active/thunks/environments';
import { useAppDispatch } from '../../../../state/store';
import { selectIsActiveTab } from '../../../../state/tabs/selectors';
import { addToDeleteQueue, addTabs, setSelectedTab } from '../../../../state/tabs/slice';
import { keepStringLengthReasonable } from '../../../../utils/string';
import { FileSystemDropdown, menuOptionDuplicate, menuOptionDelete } from '../FileSystemDropdown';

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
			id={`file_${environmentId}`}
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
