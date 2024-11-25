import { useSelector } from 'react-redux';
import { useEffect } from 'react';
import { useColorScheme } from '@mui/joy';
import invoke from '../../utils/invoke';
import { selectDefaultTheme, selectZoomLevel } from '../../state/active/selectors';
import { WorkspaceSelector } from '../workspaces/WorkspaceSelector';
import { Workspace } from './Workspace';
import { ModalsWrapper } from './modals/ModalsWrapper';
import { ListenerWrapper } from './listeners/ListenerWrapper';
import { selectActiveWorkspace } from '../../state/global/selectors';

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

	if (activeWorkspace == null) {
		return <WorkspaceSelector />;
	}

	return (
		<>
			<Workspace />
			<ModalsWrapper />
			<ListenerWrapper />
		</>
	);
}
