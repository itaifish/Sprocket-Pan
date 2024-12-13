import { useSelector } from 'react-redux';
import { useEffect } from 'react';
import { useColorScheme } from '@mui/joy';
import { WorkspaceSelector } from '../workspaces/WorkspaceSelector';
import { Workspace } from './Workspace';
import { ModalsWrapper } from './modals/ModalsWrapper';
import { ListenerWrapper } from './listeners/ListenerWrapper';
import { selectZoomLevel, selectDefaultTheme } from '@/state/active/selectors';
import { selectActiveWorkspace } from '@/state/global/selectors';
import { invoke } from '@/utils/invoke';

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
		setMode(defaultTheme);
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
