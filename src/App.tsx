import { useEffect, useState } from 'react';
import { applicationDataManager } from './managers/ApplicationDataManager';
import { log } from './utils/logging';
import { useColorScheme } from '@mui/joy';
import { useMonaco } from '@monaco-editor/react';
import { initMonaco } from './managers/MonacoInitManager';
import { ApplicationDataContext, GoToWorkspaceSelectionContext } from './managers/GlobalContextManager';
import invoke from './utils/invoke';
import { WorkspaceSelector } from './components/organisms/WorkspaceSelector';
import { Workspace } from './components/organisms/Workspace';

export function App() {
	const [workspaceState, setWorkspaceState] = useState<'noneSelected' | 'oneSelected'>('noneSelected');
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

	const selectWorkspace = (workspace: string | undefined) => {
		applicationDataManager.setWorkspace(workspace);
		setWorkspaceState('oneSelected');
	};

	return (
		<div className="container" style={{ height: '100vh' }}>
			<ApplicationDataContext.Provider value={data}>
				<GoToWorkspaceSelectionContext.Provider
					value={() => {
						setWorkspaceState('noneSelected');
					}}
				>
					{workspaceState === 'noneSelected' ? <WorkspaceSelector selectWorkspace={selectWorkspace} /> : <Workspace />}
				</GoToWorkspaceSelectionContext.Provider>
			</ApplicationDataContext.Provider>
		</div>
	);
}
