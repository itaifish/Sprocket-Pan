import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';
import '@fontsource/inter';
import { StyledEngineProvider, ThemeProvider } from '@mui/joy/styles';
import { App } from './App';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	// Remove React.Strict mode if you want to get rid of the double render
	<React.StrictMode>
		<StyledEngineProvider injectFirst>
			<ThemeProvider>
				<App />
			</ThemeProvider>
		</StyledEngineProvider>
	</React.StrictMode>,
);
