import { BASE_THEME, LIST_STYLING, LOG_LEVELS, Settings, VARIABLE_NAME_DISPLAY } from '../types/settings/settings';
import { MS_IN_MINUTE } from './constants';

export const DEFAULT_SETTINGS: Settings = {
	theme: {
		base: BASE_THEME.default,
		list: LIST_STYLING.default,
		zoom: 100,
	},
	history: {
		maxLength: 250,
	},
	data: {
		autosave: {
			enabled: true,
			intervalMS: MS_IN_MINUTE * 5,
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
	},
	log: {
		level: LOG_LEVELS.warn,
	},
};
