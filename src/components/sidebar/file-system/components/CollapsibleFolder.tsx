import { FluentFolderSvg } from '@/assets/icons/fluent/FluentFolder';
import { FluentFolderLinkSvg } from '@/assets/icons/fluent/FluentFolderLink';
import { FluentFolderLinkOpenSvg } from '@/assets/icons/fluent/FluentFolderLinkOpen';
import { FluentFolderOpenSvg } from '@/assets/icons/fluent/FluentFolderOpen';
import { useShowSync } from '@/hooks/useShowSync';
import { activeActions } from '@/state/active/slice';
import { useAppDispatch } from '@/state/store';

interface FolderProps {
	collapsed: boolean;
	id: string;
}

export function CollapsibleFolder({ collapsed, id }: FolderProps) {
	const showSync = useShowSync(id);
	const dispatch = useAppDispatch();
	const setCollapsed = (value: boolean) => {
		dispatch(activeActions.setUiMetadataById({ id: id, collapsed: value }));
	};
	let Icon = FluentFolderOpenSvg;
	if (collapsed && showSync) {
		Icon = FluentFolderLinkSvg;
	} else if (collapsed) {
		Icon = FluentFolderSvg;
	} else if (showSync) {
		Icon = FluentFolderLinkOpenSvg;
	}
	return (
		<button onClick={() => setCollapsed(!collapsed)}>
			<Icon />
		</button>
	);
}
