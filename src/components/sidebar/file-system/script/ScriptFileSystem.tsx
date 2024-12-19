import { useSelector } from 'react-redux';
import { ListItemDecorator, ListSubheader } from '@mui/joy';
import { menuOptionDuplicate, menuOptionDelete } from '../FileSystemDropdown';
import CodeIcon from '@mui/icons-material/Code';
import { FileSystemLeaf } from '../tree/FileSystemLeaf';
import { EllipsisSpan } from '@/components/shared/EllipsisTypography';
import { selectScript } from '@/state/active/selectors';
import { createScript } from '@/state/active/thunks/scripts';
import { useAppDispatch } from '@/state/store';
import { tabsActions } from '@/state/tabs/slice';
import { SyncBadge } from '../SyncBadge';

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
				<SyncBadge id={scriptId}>
					<CodeIcon fontSize="small" />
				</SyncBadge>
			</ListItemDecorator>
			<ListSubheader sx={{ width: '100%' }}>
				<EllipsisSpan>{script.name}</EllipsisSpan>
			</ListSubheader>
		</FileSystemLeaf>
	);
}
