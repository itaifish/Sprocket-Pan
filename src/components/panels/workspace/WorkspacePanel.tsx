import { Stack } from '@mui/joy';
import { PanelProps } from '../panels.interface';
import { useSelector } from 'react-redux';
import { itemActions } from '@/state/items';
import { EditableHeader } from '../shared/EditableHeader';
import { globalActions } from '@/state/global/slice';
import { useAppDispatch } from '@/state/store';
import { WorkspaceMetadata } from '@/types/data/workspace';

export function WorkspacePanel({ id }: PanelProps) {
	const workspace = useSelector((state) => itemActions.workspace.select(state, id));
	const dispatch = useAppDispatch();
	if (workspace == null) throw new Error(`${id} could not be found`);

	const update = (val: Partial<WorkspaceMetadata>) => {
		dispatch(globalActions.updateWorkspace({ ...workspace, ...val }));
	};

	return (
		<Stack p={2} gap={2}>
			<EditableHeader value={workspace.name} onChange={(name) => update({ name })} />
		</Stack>
	);
}
