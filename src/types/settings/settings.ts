import { RecursiveValueOf } from '../utils/utils';

const levels = ['service', 'endpoint', 'request'] as const;
type level = (typeof levels)[number];

export type ScriptRunnerStrategy = RecursiveValueOf<
	{
		[levelType1 in level]: {
			[levelType2 in Exclude<level, levelType1>]: {
				[levelType3 in Exclude<level, levelType1 | levelType2>]: [`${levelType1}`, `${levelType2}`, `${levelType3}`];
			};
		};
	},
	readonly string[]
>;

export enum VARIABLE_NAME_DISPLAY {
	before = 'before',
	hover = 'hover',
	none = 'none',
}

export enum BASE_THEME {
	light = 'light',
	dark = 'dark',
	default = 'system',
}

export enum LOG_LEVELS {
	debug = 'debug',
	info = 'info',
	warn = 'warn',
}

export enum LIST_STYLING {
	compact = 'compact',
	default = 'default',
	cozy = 'cozy',
}

export enum SCROLLBAR_VISIBILITY {
	hidden = 'hidden',
	compact = 'compact',
	visible = 'visible',
}

export enum TIPS_SECTION {
	hidden = 'hidden',
	tips = 'tips',
	dyk = 'dyk',
	all = 'all',
}

export enum SPLASHSCREEN {
	none = 'none',
	cooking = 'cooking',
	legacy = 'legacy',
}

export interface Settings {
	theme: {
		base: BASE_THEME;
		list: LIST_STYLING;
		zoom: number;
		scrollbarVisibility: SCROLLBAR_VISIBILITY;
	};
	history: {
		maxLength: number;
	};
	data: {
		autosave: {
			enabled: boolean;
			intervalMS: number;
		};
	};
	script: {
		strategy: {
			pre: ScriptRunnerStrategy;
			post: ScriptRunnerStrategy;
		};
		timeoutMS: number;
	};
	request: {
		timeoutMS: number;
	};
	interface: {
		variableNameDisplay: VARIABLE_NAME_DISPLAY;
		tipsSection: TIPS_SECTION;
		splashScreen: SPLASHSCREEN;
	};
	log: {
		level: LOG_LEVELS;
	};
}
