import { useSelector } from 'react-redux';
import { menuOptionDuplicate, menuOptionDelete } from '../tree/FileSystemDropdown';
import { FileSystemLeaf } from '../tree/FileSystemLeaf';
import { useAppDispatch } from '@/state/store';
import { uiActions } from '@/state/ui/slice';
import { useShowSync } from '@/hooks/useShowSync';
import { FluentLinkSvg } from '@/assets/icons/fluent/FluentLink';
import { FluentCodeSvg } from '@/assets/icons/fluent/FluentCode';
import { EllipsesP } from '../components/EllipsesP';
import { itemActions } from '@/state/items';

interface ScriptFileSystemProps {
	scriptId: string;
}

export function ScriptFileSystem({ scriptId }: ScriptFileSystemProps) {
	const script = useSelector((state) => itemActions.script.select(state, scriptId));
	const dispatch = useAppDispatch();
	const showSync = useShowSync(scriptId);

	return (
		<FileSystemLeaf
			id={scriptId}
			menuOptions={[
				menuOptionDuplicate(() => dispatch(itemActions.script.duplicate(script))),
				menuOptionDelete(() => dispatch(uiActions.addToDeleteQueue(script.id))),
			]}
		>
			<div style={{ flex: 0 }}>{showSync ? <FluentLinkSvg /> : <FluentCodeSvg />}</div>
			<EllipsesP>{script.name}</EllipsesP>
		</FileSystemLeaf>
	);
}
