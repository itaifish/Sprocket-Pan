import { RecursiveValueOf, ValuesOf } from '../utils/utils';
import { SprocketTheme } from './sprocketTheme';

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

export const LOG_LEVELS = { debug: 'debug', info: 'info', warn: 'warn' } as const;

export type LOG_LEVELS = ValuesOf<typeof LOG_LEVELS>;

export const TIPS_SECTION = { hidden: 'hidden', tips: 'tips', dyk: 'dyk', all: 'all' } as const;

export type TIPS_SECTION = ValuesOf<typeof TIPS_SECTION>;

export const VARIABLE_NAME_DISPLAY = { before: 'before', hover: 'hover', none: 'none' } as const;

export type VARIABLE_NAME_DISPLAY = ValuesOf<typeof VARIABLE_NAME_DISPLAY>;

export const LIST_STYLING = { compact: 'compact', default: 'default', cozy: 'cozy' } as const;

export type LIST_STYLING = ValuesOf<typeof LIST_STYLING>;

export const SCROLLBAR_VISIBILITY = { hidden: 'hidden', compact: 'compact', visible: 'visible' } as const;

export type SCROLLBAR_VISIBILITY = ValuesOf<typeof SCROLLBAR_VISIBILITY>;

export interface Settings {
	virtualization: {
		enabled: boolean;
	};
	theme: SprocketTheme;
	history: {
		maxLength: number;
		enabled: boolean;
		maxDays: number;
	};
	data: {
		autosave: {
			enabled: boolean;
			intervalMS: number;
		};
		sync: {
			enabled: boolean;
			location: string | null;
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
	};
	log: {
		level: LOG_LEVELS;
	};
}
