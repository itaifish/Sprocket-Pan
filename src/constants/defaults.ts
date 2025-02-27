import {
	Settings,
	BaseTheme,
	ListStyling,
	ScrollbarVisibility,
	VariableNameDisplay,
	TipsSection,
	LogLevels,
} from '@/types/data/settings';
import { MS_IN_MINUTE } from './constants';

export const DEFAULT_SETTINGS: Settings = {
	virtualization: {
		enabled: true,
	},
	theme: {
		base: BaseTheme.default,
		list: ListStyling.default,
		zoom: 100,
		scrollbarVisibility: ScrollbarVisibility.compact,
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
		validation: {
			enabled: true,
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
		variableNameDisplay: VariableNameDisplay.before,
		tipsSection: TipsSection.tips,
	},
	log: {
		level: LogLevels.warn,
	},
};
