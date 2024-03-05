import { useEffect, useState } from 'react';
import { applicationDataManager } from './managers/ApplicationDataManager';
import { log } from './utils/logging';
import { useColorScheme } from '@mui/joy';
import { useMonaco } from '@monaco-editor/react';
import { initMonaco } from './managers/MonacoInitManager';
import invoke from './utils/invoke';
import { Provider } from 'react-redux';
import { store } from './state/store';
import { Root } from './components/organisms/Root';
import { ApplicationDataContext } from './managers/GlobalContextManager';

export function App() {
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
					<Root />
				</ApplicationDataContext.Provider>
			</Provider>
		</div>
	);
}
