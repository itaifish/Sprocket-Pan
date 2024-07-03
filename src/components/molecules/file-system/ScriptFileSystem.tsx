import { useSelector } from 'react-redux';
import { selectIsActiveTab } from '../../../state/tabs/selectors';
import { ListItem, ListItemButton, ListItemDecorator, ListSubheader } from '@mui/joy';
import { FileSystemDropdown, menuOptionDelete, menuOptionDuplicate } from './FileSystemDropdown';
import { addScript } from '../../../state/active/slice';
import CodeIcon from '@mui/icons-material/Code';
import { selectScript } from '../../../state/active/selectors';
import { useAppDispatch } from '../../../state/store';
import { keepStringLengthReasonable } from '../../../utils/string';
import { addTabs, addToDeleteQueue, setSelectedTab } from '../../../state/tabs/slice';

interface ScriptFileSystemProps {
	scriptId: string;
}

export function ScriptFileSystem({ scriptId }: ScriptFileSystemProps) {
	const isSelected = useSelector((state) => selectIsActiveTab(state, scriptId));
	const script = useSelector((state) => selectScript(state, scriptId));
	const dispatch = useAppDispatch();

	return (
		<ListItem
			nested
			endAction={
				<FileSystemDropdown
					options={[
						menuOptionDuplicate(() =>
							dispatch(addScript({ scriptName: `${script.name} (Copy)`, scriptContent: script.content })),
						),
						menuOptionDelete(() => dispatch(addToDeleteQueue(script.id))),
					]}
				/>
			}
		>
			<ListItemButton
				onClick={() => {
					dispatch(addTabs({ [script.id]: 'script' }));
					dispatch(setSelectedTab(script.id));
				}}
				selected={isSelected}
			>
				<ListItemDecorator>
					<CodeIcon fontSize="small" />
				</ListItemDecorator>
				<ListSubheader>{keepStringLengthReasonable(script.name)}</ListSubheader>
			</ListItemButton>
		</ListItem>
	);
}
