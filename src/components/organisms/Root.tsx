import { useSelector } from 'react-redux';
import { selectActiveWorkspace } from '../../state/workspaces/selectors';
import { WorkspaceSelector } from './WorkspaceSelector';
import { Workspace } from './Workspace';

export function Root() {
	const activeWorkspace = useSelector(selectActiveWorkspace);
	return <>{activeWorkspace == null ? <WorkspaceSelector /> : <Workspace />}</>;
}
