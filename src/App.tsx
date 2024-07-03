import { Provider } from 'react-redux';
import { store } from './state/store';
import { Root } from './components/organisms/Root';

export function App() {
	return (
		<div className="container" style={{ height: '100vh' }}>
			<Provider store={store}>
				<Root />
			</Provider>
		</div>
	);
}
