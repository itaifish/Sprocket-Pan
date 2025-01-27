import { Provider, useSelector } from 'react-redux';
import { store } from './state/store';
import { Root } from './components/root/Root';
import { CssBaseline, CssVarsProvider } from '@mui/joy';
import { createTheme } from './utils/style';
import { selectTheme } from './state/active/selectors';
import { selectGlobalThemes } from './state/global/selectors';

function ReduxApp() {
	const { selected } = useSelector(selectTheme);
	const themes = useSelector(selectGlobalThemes);
	const { colors, filters } = themes[selected];
	return (
		<CssVarsProvider theme={createTheme(colors)} disableTransitionOnChange defaultMode="system">
			<CssBaseline />
			<div className="container" style={{ height: '100vh' }}>
				<Root />
			</div>
			<div
				style={{
					display: filters.enabled ? 'block' : 'none',
					backdropFilter: `contrast(${filters.contrast})`,
					position: 'absolute',
					zIndex: 9999,
					top: 0,
					bottom: 0,
					left: 0,
					right: 0,
					pointerEvents: 'none',
				}}
			/>
		</CssVarsProvider>
	);
}

export function App() {
	return (
		<Provider store={store}>
			<ReduxApp />
		</Provider>
	);
}
