import { Environment } from '../types/application-data/application-data';

interface ProbablyAnEnvironment {
	__name: string;
	__id: string;
	__data: { key: string; value: string }[];
}

export function asEnv(env: ProbablyAnEnvironment) {
	return env as unknown as Environment;
}
