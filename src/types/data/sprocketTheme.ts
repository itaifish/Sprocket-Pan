import { ValuesOf } from '../utils/utils';
import { LIST_STYLING, SCROLLBAR_VISIBILITY } from './settings';

export const BASE_THEME = { light: 'light', dark: 'dark', default: 'system' } as const;

export type BASE_THEME = ValuesOf<typeof BASE_THEME>;

export type SprocketTheme = {
	base: BASE_THEME;
	list: LIST_STYLING;
	zoom: number;
	scrollbarVisibility: SCROLLBAR_VISIBILITY;
	decoration: {
		opacity: number;
	};
	colors: {
		primary: string;
		neutral: string;
		danger: string;
		success: string;
		warning: string;
	};
	filters: {
		enabled: boolean;
		contrast: number;
	};
};
