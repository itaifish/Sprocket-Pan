import { Stack } from '@mui/joy';
import { PanelProps } from '../panels.interface';
import { useSelector } from 'react-redux';
import { itemActions } from '@/state/items';

export function WorkspacePanel({ id }: PanelProps) {
	const workspace = useSelector((state) => itemActions.workspace.select(state, id));
	if (workspace == null) throw new Error(`Workspace panel could not be determined from workspace w/ id ${id}`);
	return (
		<Stack p={2} gap={2}>
			UNDER CONSTRUCTION {workspace.name}
		</Stack>
	);
}
