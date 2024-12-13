import { getEditorTheme } from '@/utils/style';
import { useColorScheme } from '@mui/joy';

export function useEditorTheme() {
	return getEditorTheme(useColorScheme());
}
