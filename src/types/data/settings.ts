import { RecursiveValueOf, TypeOf } from '../utils/utils';

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

export const VariableNameDisplay = {
	before: 'before',
	hover: 'hover',
	none: 'none',
} as const;

export type VariableNameDisplay = TypeOf<typeof VariableNameDisplay>;

export const BaseTheme = {
	light: 'light',
	dark: 'dark',
	default: 'system',
} as const;

export type BaseTheme = TypeOf<typeof BaseTheme>;

export const LogLevels = {
	debug: 'debug',
	info: 'info',
	warn: 'warn',
} as const;

export type LogLevels = TypeOf<typeof LogLevels>;

export const ListStyling = {
	compact: 'compact',
	default: 'default',
	cozy: 'cozy',
} as const;

export type ListStyling = TypeOf<typeof ListStyling>;

export const ScrollbarVisibility = {
	hidden: 'hidden',
	compact: 'compact',
	visible: 'visible',
} as const;

export type ScrollbarVisibility = TypeOf<typeof ScrollbarVisibility>;

export const TipsSection = {
	hidden: 'hidden',
	tips: 'tips',
	dyk: 'dyk',
	all: 'all',
} as const;

export type TipsSection = TypeOf<typeof TipsSection>;

export interface Settings {
	virtualization: {
		enabled: boolean;
	};
	theme: {
		base: BaseTheme;
		list: ListStyling;
		zoom: number;
		scrollbarVisibility: ScrollbarVisibility;
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
		validation: {
			enabled: boolean;
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
		variableNameDisplay: VariableNameDisplay;
		tipsSection: TipsSection;
	};
	log: {
		level: LogLevels;
	};
}
