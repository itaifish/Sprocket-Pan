import { useSelector } from 'react-redux';
import { ListItem, ListItemButton, ListItemDecorator, ListSubheader } from '@mui/joy';
import { selectScript } from '../../../../state/active/selectors';
import { addScript } from '../../../../state/active/slice';
import { useAppDispatch } from '../../../../state/store';
import { selectIsActiveTab } from '../../../../state/tabs/selectors';
import { addToDeleteQueue, addTabs, setSelectedTab } from '../../../../state/tabs/slice';
import { keepStringLengthReasonable } from '../../../../utils/string';
import { FileSystemDropdown, menuOptionDuplicate, menuOptionDelete } from '../FileSystemDropdown';
import CodeIcon from '@mui/icons-material/Code';

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
