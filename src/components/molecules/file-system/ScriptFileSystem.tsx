import { useSelector } from 'react-redux';
import { selectIsActiveTab } from '../../../state/tabs/selectors';
import { ListItem, ListItemButton, ListItemDecorator, ListSubheader } from '@mui/joy';
import { FileSystemDropdown, menuOptionDelete, menuOptionDuplicate } from './FileSystemDropdown';
import { addScript, deleteScript } from '../../../state/active/slice';
import CodeIcon from '@mui/icons-material/Code';
import { selectScript } from '../../../state/active/selectors';
import { useAppDispatch } from '../../../state/store';
import { keepStringLengthReasonable } from '../../../utils/string';
import { addTabs, setSelectedTab } from '../../../state/tabs/slice';

interface ScriptFileSystemProps {
	scriptName: string;
}

export function ScriptFileSystem({ scriptName }: ScriptFileSystemProps) {
	const isSelected = useSelector((state) => selectIsActiveTab(state, scriptName));
	const script = useSelector((state) => selectScript(state, scriptName));
	const dispatch = useAppDispatch();

	return (
		<>
			<ListItem
				nested
				endAction={
					<FileSystemDropdown
						options={[
							menuOptionDuplicate(() => dispatch(addScript({ scriptName: `${scriptName} (Copy)`, script }))),
							menuOptionDelete(() => dispatch(deleteScript({ scriptName }))),
						]}
					/>
				}
			>
				<ListItemButton
					onClick={() => {
						dispatch(addTabs({ [scriptName]: 'script' }));
						dispatch(setSelectedTab(scriptName));
					}}
					selected={isSelected}
				>
					<ListItemDecorator>
						<CodeIcon fontSize="small" />
					</ListItemDecorator>
					<ListSubheader>{keepStringLengthReasonable(scriptName)}</ListSubheader>
				</ListItemButton>
			</ListItem>
		</>
	);
}
