import { Typography } from '@mui/joy';
import { ApplicationData, Environment } from '../types/application-data/application-data';

type Snippet = {
	value: string;
	variableName?: string;
};

class EnvironmentContextResolver {
	public static readonly INSTANCE = new EnvironmentContextResolver();
	private constructor() {}

	public stringWithVarsToTypography(
		text: string,
		data: ApplicationData,
		serviceId?: string,
		requestId?: string,
		typographyProps?: React.ComponentProps<typeof Typography>,
	) {
		const snippets = this.parseStringWithEnvironmentOverrides(text, data, serviceId, requestId);
		return this.snippetsToTypography(snippets, typographyProps);
	}

	public stringWithEnvironmentToTypography(
		text: string,
		env: Environment,
		typographyProps?: React.ComponentProps<typeof Typography>,
	) {
		const snippets = this.parseStringWithEnvironment(text, env);
		return this.snippetsToTypography(snippets, typographyProps);
	}

	private snippetsToTypography(snippets: Snippet[], typographyProps?: React.ComponentProps<typeof Typography>) {
		return (
			<Typography {...typographyProps}>
				{snippets.map((snippet, index) => {
					if (snippet.variableName) {
						return (
							<Typography variant="outlined" color={snippet.value ? 'success' : 'danger'} key={index}>
								{`${snippet.variableName}`}: {snippet.value ?? 'unknown'}
							</Typography>
						);
					} else {
						return snippet.value;
					}
				})}
			</Typography>
		);
	}

	public resolveVariablesForString(text: string, data: ApplicationData, serviceId?: string, requestId?: string) {
		const snippets = this.parseStringWithEnvironmentOverrides(text, data, serviceId, requestId);
		return snippets.map((snippet) => snippet.value).join('');
	}

	public resolveVariablesForMappedObject<T extends Record<string, unknown>>(
		object: T,
		context: {
			data: ApplicationData;
			serviceId?: string;
			requestId?: string;
		},
	) {
		const { data, serviceId, requestId } = context;
		const newObj: Record<string, unknown> = {};
		Object.keys(object).forEach((key) => {
			const newKey = this.resolveVariablesForString(key, data, serviceId, requestId);
			newObj[newKey] = this.resolveVariableForObjectKey(object, key, context);
		});
		return newObj;
	}

	private resolveVariableForObjectKey<T extends object, TKey extends keyof T & (string | number)>(
		object: T,
		key: TKey,
		context: {
			data: ApplicationData;
			serviceId?: string;
			requestId?: string;
		},
	): T[TKey] {
		const { data, serviceId, requestId } = context;
		const oldValue = object[key];
		if (oldValue === null) {
			return null as T[TKey];
		} else if (typeof oldValue === 'object') {
			if (Array.isArray(oldValue)) {
				return oldValue.map((_val, index) => this.resolveVariableForObjectKey(oldValue, index, context)) as T[TKey];
			} else {
				return this.resolveVariablesForMappedObject(
					oldValue as T[keyof T] & Record<string, unknown>,
					context,
				) as T[TKey];
			}
		} else if (typeof oldValue === 'string') {
			return this.resolveVariablesForString(oldValue, data, serviceId, requestId) as T[TKey];
		}
		return oldValue;
	}

	public parseStringWithEnvironment(text: string, env: Environment): Snippet[] {
		text = text.toString();
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

	public parseStringWithEnvironmentOverrides(
		text: string,
		data: ApplicationData,
		serviceId?: string,
		requestId?: string,
	) {
		const env = this.buildEnvironmentVariables(data, serviceId, requestId);
		return this.parseStringWithEnvironment(text, env);
	}

	public buildEnvironmentVariables(data: ApplicationData, serviceId?: string, requestId?: string) {
		let env: Environment = { __name: '', __id: '' };
		if (data.selectedEnvironment) {
			env = { ...data.environments[data.selectedEnvironment] };
		}
		if (serviceId) {
			const service = data.services[serviceId];
			if (service?.selectedEnvironment) {
				env = { ...env, ...service.localEnvironments[service.selectedEnvironment] };
			}
		}
		if (requestId) {
			const request = data.requests[requestId];
			if (request?.environmentOverride) {
				env = { ...env, ...request.environmentOverride };
			}
		}
		return env;
	}
}

export const environmentContextResolver = EnvironmentContextResolver.INSTANCE;
