import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';
import '@fontsource/inter';
import { StyledEngineProvider } from '@mui/joy/styles';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	<React.StrictMode>
		<StyledEngineProvider injectFirst>
			<App />
		</StyledEngineProvider>
	</React.StrictMode>,
);
