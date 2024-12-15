import {
	Settings,
	BASE_THEME,
	LIST_STYLING,
	SCROLLBAR_VISIBILITY,
	VARIABLE_NAME_DISPLAY,
	TIPS_SECTION,
	LOG_LEVELS,
} from '@/types/data/settings';
import { MS_IN_MINUTE } from './constants';

export const DEFAULT_SETTINGS: Settings = {
	theme: {
		base: BASE_THEME.default,
		list: LIST_STYLING.default,
		zoom: 100,
		scrollbarVisibility: SCROLLBAR_VISIBILITY.compact,
	},
	history: {
		maxLength: 250,
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
