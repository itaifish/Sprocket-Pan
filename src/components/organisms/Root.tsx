import { useSelector } from 'react-redux';
import { selectActiveWorkspace } from '../../state/workspaces/selectors';
import { WorkspaceSelector } from './WorkspaceSelector';
import { Workspace } from './Workspace';
import { useEffect } from 'react';
import { useColorScheme } from '@mui/joy';
import invoke from '../../utils/invoke';
import { selectDefaultTheme, selectZoomLevel } from '../../state/active/selectors';

export function Root() {
	const activeWorkspace = useSelector(selectActiveWorkspace);
	const zoomLevel = useSelector(selectZoomLevel);
	const defaultTheme = useSelector(selectDefaultTheme);
	const { setMode } = useColorScheme();

	useEffect(() => {
		invoke('close_splashscreen', undefined);
	}, []);

	useEffect(() => {
		invoke('zoom', { amount: zoomLevel / 100 });
	}, [zoomLevel]);

	useEffect(() => {
		setMode(defaultTheme === 'system-default' ? 'system' : defaultTheme);
	}, [defaultTheme]);

	return <>{activeWorkspace == null ? <WorkspaceSelector /> : <Workspace />}</>;
}
