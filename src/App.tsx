import { useEffect } from 'react';
import { useMonaco } from '@monaco-editor/react';
import { initMonaco } from './managers/MonacoInitManager';
import { Provider } from 'react-redux';
import { store } from './state/store';
import { Root } from './components/organisms/Root';

export function App() {
	const monaco = useMonaco();

	useEffect(() => {
		if (monaco) {
			initMonaco(monaco);
		}
	}, [monaco]);

	return (
		<div className="container" style={{ height: '100vh' }}>
			<Provider store={store}>
				<Root />
			</Provider>
		</div>
	);
}
