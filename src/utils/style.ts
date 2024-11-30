import { useColorScheme } from '@mui/joy';

export function getMode(colorScheme: ReturnType<typeof useColorScheme>) {
	const selectedMode = colorScheme.mode;
	const systemMode = colorScheme.systemMode;
	return selectedMode === 'system' ? systemMode : selectedMode;
}

export function getEditorTheme(colorScheme: ReturnType<typeof useColorScheme>) {
	const resolvedMode = getMode(colorScheme);
	return resolvedMode === 'dark' ? 'vs-dark' : resolvedMode;
}
