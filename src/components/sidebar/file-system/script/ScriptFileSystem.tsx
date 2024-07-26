import { useSelector } from 'react-redux';
import { ListItem, ListItemButton, ListItemDecorator, ListSubheader } from '@mui/joy';
import { selectScript } from '../../../../state/active/selectors';
import { useAppDispatch } from '../../../../state/store';
import { selectIsActiveTab } from '../../../../state/tabs/selectors';
import { addToDeleteQueue, addTabs, setSelectedTab } from '../../../../state/tabs/slice';
import { keepStringLengthReasonable } from '../../../../utils/string';
import { FileSystemDropdown, menuOptionDuplicate, menuOptionDelete } from '../FileSystemDropdown';
import CodeIcon from '@mui/icons-material/Code';
import { createScript } from '../../../../state/active/thunks/scripts';

interface ScriptFileSystemProps {
	scriptId: string;
}

export function ScriptFileSystem({ scriptId }: ScriptFileSystemProps) {
	const isSelected = useSelector((state) => selectIsActiveTab(state, scriptId));
	const script = useSelector((state) => selectScript(state, scriptId));
	const dispatch = useAppDispatch();

	return (
		<ListItem
			id={`file_${scriptId}`}
			nested
			endAction={
				<FileSystemDropdown
					options={[
						menuOptionDuplicate(() =>
							dispatch(
								createScript({
									name: `${script.name} (Copy)`,
									content: script.content,
									returnVariableName: script.returnVariableName,
									returnVariableType: structuredClone(script.returnVariableType),
								}),
							),
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
