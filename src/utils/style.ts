import { Settings } from '@/types/data/settings';
import { extendTheme, Theme, useColorScheme } from '@mui/joy';
import chroma from 'chroma-js';

declare module '@mui/joy/styles' {
	interface PaletteBackgroundOverrides {
		level4: true;
	}
}

export function getMode(colorScheme: ReturnType<typeof useColorScheme>) {
	const selectedMode = colorScheme.mode;
	const systemMode = colorScheme.systemMode;
	return selectedMode === 'system' ? systemMode : selectedMode;
}

export function getEditorTheme(colorScheme: ReturnType<typeof useColorScheme>) {
	const resolvedMode = getMode(colorScheme);
	return resolvedMode === 'dark' ? 'vs-dark' : resolvedMode;
}

/**
 * Creates a Joy-compatible palette spread based on the given color.
 * If given undefined, makes a spread based on black (which will turn most things using it black or dark grey).
 * If given a color that cannot be parsed by chroma.hex(), will throw.
 */
export function createPalette(hex = '#000000') {
	const color = chroma.hex(hex);
	const scale = chroma.scale([color.brighten(6), color, color.darken(6)]).domain([0, 1000]);
	return {
		50: scale(50).hex(),
		100: scale(100).hex(),
		200: scale(200).hex(),
		300: scale(300).hex(),
		400: scale(400).hex(),
		500: scale(500).hex(),
		600: scale(600).hex(),
		700: scale(700).hex(),
		800: scale(800).hex(),
		900: scale(900).hex(),
		1000: scale(1000).hex(),
	};
}

export function createTheme(colors: Settings['theme']['colors']): Theme {
	const paletteColors = {
		primary: createPalette(colors.primary),
		warning: createPalette(colors.warning),
		danger: createPalette(colors.danger),
		neutral: createPalette(colors.neutral),
		success: createPalette(colors.success),
	};
	return extendTheme({
		colorSchemes: {
			light: {
				palette: {
					...paletteColors,
					text: {
						primary: 'var(--joy-palette-neutral-800)',
						secondary: 'var(--joy-palette-neutral-700)',
						tertiary: 'var(--joy-palette-neutral-600)',
						icon: 'var(--joy-palette-neutral-600)',
					},
					background: {
						surface: chroma(paletteColors.neutral[50]).brighten(0.25).hex(),
						level1: 'var(--joy-palette-neutral-50)',
						level2: 'var(--joy-palette-neutral-100)',
						level3: 'var(--joy-palette-neutral-200)',
						level4: 'var(--joy-palette-neutral-300)',
					},
				},
			},
			dark: {
				palette: {
					...paletteColors,
					text: {
						primary: 'var(--joy-palette-neutral-50)',
						secondary: 'var(--joy-palette-neutral-100)',
						tertiary: 'var(--joy-palette-neutral-200)',
						icon: 'var(--joy-palette-neutral-300)',
					},
					background: {
						level2: chroma.mix(paletteColors.neutral[800], paletteColors.neutral[700]).hex(),
						level3: 'var(--joy-palette-neutral-700)',
						level4: chroma.mix(paletteColors.neutral[700], paletteColors.neutral[600]).hex(),
					},
				},
			},
		},
	});
}
