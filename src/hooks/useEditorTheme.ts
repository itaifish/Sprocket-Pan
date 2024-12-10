import { useColorScheme } from '@mui/joy';
import { getEditorTheme } from '../utils/style';

export function useEditorTheme() {
	return getEditorTheme(useColorScheme());
}
