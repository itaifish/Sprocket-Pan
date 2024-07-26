import { useColorScheme } from '@mui/joy';

export function useEditorTheme() {
	const { mode, systemMode } = useColorScheme();
	const resolvedMode = mode === 'system' ? systemMode : mode;
	return resolvedMode === 'dark' ? 'vs-dark' : resolvedMode;
}
