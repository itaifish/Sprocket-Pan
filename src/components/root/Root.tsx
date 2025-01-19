import { useSelector } from 'react-redux';
import { useEffect } from 'react';
import { useColorScheme } from '@mui/joy';
import { WorkspaceSelector } from '../workspaces/WorkspaceSelector';
import { Workspace } from './Workspace';
import { ModalsWrapper } from './modals/ModalsWrapper';
import { ListenerWrapper } from './listeners/ListenerWrapper';
import { selectZoomLevel, selectDefaultTheme } from '@/state/active/selectors';
import { selectActiveWorkspace } from '@/state/global/selectors';
import { ErrorBoundary } from 'react-error-boundary';
import { RootErrorFallback } from './RootErrorFallback';
import { RustInvoker } from '@/managers/RustInvoker';
import { Toasts } from './Toasts';

export function Root() {
	const activeWorkspace = useSelector(selectActiveWorkspace);
	const zoomLevel = useSelector(selectZoomLevel);
	const defaultTheme = useSelector(selectDefaultTheme);
	const { setMode } = useColorScheme();

	useEffect(() => {
		RustInvoker.closeSplashscreen();
	}, []);

	useEffect(() => {
		RustInvoker.zoom(zoomLevel / 100);
	}, [zoomLevel]);

	useEffect(() => {
		setMode(defaultTheme);
	}, [defaultTheme]);

	return (
		<ErrorBoundary FallbackComponent={RootErrorFallback}>
			{activeWorkspace == null ? (
				<WorkspaceSelector />
			) : (
				<>
					<Workspace />
					<ListenerWrapper />
				</>
			)}
			<ModalsWrapper />

			<Toasts />
		</ErrorBoundary>
	);
}
