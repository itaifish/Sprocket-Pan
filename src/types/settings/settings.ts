import { RecursiveValueOf } from '../utils/utils';

const levels = ['service', 'endpoint', 'request'] as const;
type level = (typeof levels)[number];

type ScriptRunnerStrategy = RecursiveValueOf<
	{
		[levelType1 in level]: {
			[levelType2 in Exclude<level, levelType1>]: {
				[levelType3 in Exclude<level, levelType1 | levelType2>]: [`${levelType1}`, `${levelType2}`, `${levelType3}`];
			};
		};
	},
	readonly string[]
>;

export type Settings = {
	debugLogs: boolean;
	zoomLevel: number;
	timeoutDurationMS: number;
	defaultTheme: 'light' | 'dark' | 'system-default';
	maxHistoryLength: number;
	displayVariableNames: boolean;
	scriptRunnerStrategy: {
		pre: ScriptRunnerStrategy;
		post: ScriptRunnerStrategy;
	};
};
