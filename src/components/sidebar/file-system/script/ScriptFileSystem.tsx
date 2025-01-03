import { useSelector } from 'react-redux';
import { menuOptionDuplicate, menuOptionDelete } from '../tree/FileSystemDropdown';
import { FileSystemLeaf } from '../tree/FileSystemLeaf';
import { selectScript } from '@/state/active/selectors';
import { createScript } from '@/state/active/thunks/scripts';
import { useAppDispatch } from '@/state/store';
import { tabsActions } from '@/state/tabs/slice';
import { useShowSync } from '@/hooks/useShowSync';
import { FluentLinkSvg } from '@/assets/icons/fluent/FluentLink';
import { FluentCodeSvg } from '@/assets/icons/fluent/FluentCode';
import { EllipsesP } from '../components/EllipsesP';

interface ScriptFileSystemProps {
	scriptId: string;
}

export function ScriptFileSystem({ scriptId }: ScriptFileSystemProps) {
	const script = useSelector((state) => selectScript(state, scriptId));
	const dispatch = useAppDispatch();
	const showSync = useShowSync(scriptId);

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
			<div style={{ flex: 0 }}>{showSync ? <FluentLinkSvg /> : <FluentCodeSvg />}</div>
			<EllipsesP>{script.name}</EllipsesP>
		</FileSystemLeaf>
	);
}
