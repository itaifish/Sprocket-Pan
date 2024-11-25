import { useSelector } from 'react-redux';
import { ListItemDecorator, ListSubheader } from '@mui/joy';
import { selectScript } from '../../../../state/active/selectors';
import { useAppDispatch } from '../../../../state/store';
import { menuOptionDuplicate, menuOptionDelete } from '../FileSystemDropdown';
import CodeIcon from '@mui/icons-material/Code';
import { createScript } from '../../../../state/active/thunks/scripts';
import { EllipsisSpan } from '../../../shared/EllipsisTypography';
import { FileSystemLeaf } from '../tree/FileSystemLeaf';
import { tabsActions } from '../../../../state/tabs/slice';

interface ScriptFileSystemProps {
	scriptId: string;
}

export function ScriptFileSystem({ scriptId }: ScriptFileSystemProps) {
	const script = useSelector((state) => selectScript(state, scriptId));
	const dispatch = useAppDispatch();

	return (
		<FileSystemLeaf
			id={scriptId}
			tabType="script"
			menuOptions={[
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
				menuOptionDelete(() => dispatch(tabsActions.addToDeleteQueue(script.id))),
			]}
		>
			<ListItemDecorator>
				<CodeIcon fontSize="small" />
			</ListItemDecorator>
			<ListSubheader sx={{ width: '100%' }}>
				<EllipsisSpan>{script.name}</EllipsisSpan>
			</ListSubheader>
		</FileSystemLeaf>
	);
}
