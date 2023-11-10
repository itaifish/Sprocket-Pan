import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';
import '@fontsource/inter';
import { CssVarsProvider, StyledEngineProvider } from '@mui/joy/styles';
import { CssBaseline } from '@mui/joy';
import { App } from './App';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	<React.StrictMode>
		<StyledEngineProvider injectFirst>
			<CssVarsProvider disableTransitionOnChange>
				<CssBaseline />
				<App />
			</CssVarsProvider>
		</StyledEngineProvider>
	</React.StrictMode>,
);
