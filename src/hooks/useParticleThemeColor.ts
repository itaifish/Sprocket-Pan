import { useColorScheme, useTheme } from '@mui/joy';
import chroma from 'chroma-js';

export function useParticleThemeColor() {
	const theme = useTheme();
	const { mode } = useColorScheme();
	const color = theme.palette.primary[mode === 'light' ? 'lightChannel' : 'darkChannel'];
	const colorRgb = `rgb(${color.replaceAll(' ', ', ')})`;
	return chroma(colorRgb).hex();
}
