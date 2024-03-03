import { useEffect, useState } from 'react';
import { applicationDataManager } from './managers/ApplicationDataManager';
import { log } from './utils/logging';
import { useColorScheme } from '@mui/joy';
import { useMonaco } from '@monaco-editor/react';
import { initMonaco } from './managers/MonacoInitManager';
import { ApplicationDataContext } from './managers/GlobalContextManager';
import invoke from './utils/invoke';
import { WorkspaceSelector } from './components/organisms/WorkspaceSelector';
import { Workspace } from './components/organisms/Workspace';
import { Provider, useSelector } from 'react-redux';
import { selectActiveWorkspace } from './state/workspaces/selectors';
import { store } from './state/store';

export function App() {
	const activeWorkspace = useSelector(selectActiveWorkspace);
	const [data, setData] = useState(applicationDataManager.getApplicationData());
	const monaco = useMonaco();
	const { setMode } = useColorScheme();

	useEffect(() => {
		const event = () => {
			log.info(`update seen`);
			setData(applicationDataManager.getApplicationData());
		};
		applicationDataManager.on('update', event);
		invoke('close_splashscreen', undefined);
		return () => {
			applicationDataManager.off('update', event);
		};
	}, []);

	useEffect(() => {
		invoke('zoom', { amount: data.settings.zoomLevel / 100 });
	}, [data.settings.zoomLevel]);

	useEffect(() => {
		setMode(data.settings.defaultTheme === 'system-default' ? 'system' : data.settings.defaultTheme);
	}, [data.settings.defaultTheme]);

	useEffect(() => {
		if (monaco) {
			initMonaco(monaco);
		}
	}, [monaco]);

	return (
		<div className="container" style={{ height: '100vh' }}>
			<Provider store={store}>
				<ApplicationDataContext.Provider value={data}>
					{activeWorkspace == null ? <WorkspaceSelector /> : <Workspace />}
				</ApplicationDataContext.Provider>
			</Provider>
		</div>
	);
}
