import { useSelector } from 'react-redux';
import { menuOptionDuplicate, menuOptionDelete } from '../tree/FileSystemDropdown';
import CodeIcon from '@mui/icons-material/Code';
import { FileSystemLeaf } from '../tree/FileSystemLeaf';
import { EllipsisSpan } from '@/components/shared/EllipsisTypography';
import { selectScript } from '@/state/active/selectors';
import { createScript } from '@/state/active/thunks/scripts';
import { useAppDispatch } from '@/state/store';
import { tabsActions } from '@/state/tabs/slice';
import { SyncBadge } from '../components/SyncBadge';

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
						}),
					),
				),
				menuOptionDelete(() => dispatch(tabsActions.addToDeleteQueue(script.id))),
			]}
		>
			<SyncBadge id={scriptId}>
				<CodeIcon fontSize="small" />
			</SyncBadge>
			<EllipsisSpan>{script.name}</EllipsisSpan>
		</FileSystemLeaf>
	);
}
