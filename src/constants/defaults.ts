import {
	Settings,
	LOG_LEVELS,
	TIPS_SECTION,
	LIST_STYLING,
	SCROLLBAR_VISIBILITY,
	VARIABLE_NAME_DISPLAY,
} from '@/types/data/settings';
import { MS_IN_MINUTE } from './constants';
import { BASE_THEME } from '@/types/data/sprocketTheme';

export const DEFAULT_SETTINGS: Settings = {
	virtualization: {
		enabled: true,
	},
	theme: {
		base: BASE_THEME.default,
		list: LIST_STYLING.default,
		zoom: 100,
		scrollbarVisibility: SCROLLBAR_VISIBILITY.compact,
		decoration: {
			opacity: 0.3,
		},
		colors: {
			primary: '#005C8A',
			neutral: '#3F444A',
			danger: '#C41C1C',
			success: '#1F7A1F',
			warning: '#C06C0C',
		},
		filters: {
			enabled: false,
			contrast: 1,
		},
	},
	history: {
		maxLength: 250,
		enabled: true,
		maxDays: -1,
	},
	data: {
		autosave: {
			enabled: true,
			intervalMS: MS_IN_MINUTE * 5,
		},
		sync: {
			enabled: false,
			location: null,
		},
	},
	script: {
		strategy: {
			pre: ['service', 'endpoint', 'request'],
			post: ['request', 'endpoint', 'service'],
		},
		timeoutMS: MS_IN_MINUTE * 2,
	},
	request: {
		timeoutMS: MS_IN_MINUTE * 1,
	},
	interface: {
		variableNameDisplay: VARIABLE_NAME_DISPLAY.before,
		tipsSection: TIPS_SECTION.tips,
	},
	log: {
		level: LOG_LEVELS.warn,
	},
};
