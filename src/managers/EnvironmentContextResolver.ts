import { ApplicationData, Environment } from '../types/application-data/application-data';

class EnvironmentContextResolver {
	public static readonly INSTANCE = new EnvironmentContextResolver();
	private constructor() {}

	public parseStringWithEnvironmentOverrides(text: string, data: ApplicationData, serviceId?: string) {
		const env = this.buildEnvironmentVariables(data, serviceId);
		let state: 'variable' | 'text' = 'text';
		let startVariablePos = 0;
		const resultText = [];
		for (let i = 0; i < text.length; i++) {
			if (text.charAt(i) === '{' && state === 'text') {
				resultText.push({ value: text.slice(startVariablePos, i) });
				state = 'variable';
				startVariablePos = i + 1;
			}
			if (text.charAt(i) === '}' && state === 'variable') {
				state = 'text';
				const variableName = text.slice(startVariablePos, i);
				resultText.push({ variableName, value: env[variableName] });
				startVariablePos = i + 1;
			}
		}
		const endPiece = { value: text.slice(startVariablePos) };
		if (endPiece.value != '') {
			resultText.push(endPiece);
		}
		return resultText;
	}

	private buildEnvironmentVariables(data: ApplicationData, serviceId?: string) {
		let env: Environment = {};
		if (data.selectedEnvironment) {
			env = { ...data.environments[data.selectedEnvironment] };
		}
		if (serviceId) {
			const service = data.services[serviceId];
			if (service?.selectedEnvironment) {
				env = { ...env, ...service.localEnvironments[service.selectedEnvironment] };
			}
		}
		return env;
	}
}

export const environmentContextResolver = EnvironmentContextResolver.INSTANCE;
