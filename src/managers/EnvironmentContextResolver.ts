import { OrderedKeyValuePairs } from '../classes/OrderedKeyValuePairs';
import { WorkspaceData } from '../types/application-data/application-data';

export type Snippet = {
	value: string;
	variableName?: string;
};

type PickedWorkspaceData = Pick<
	WorkspaceData,
	'selectedEnvironment' | 'services' | 'environments' | 'requests' | 'settings'
>;

export class EnvironmentContextResolver {
	public static stringWithVarsToSnippet(
		text: string,
		data: PickedWorkspaceData,
		serviceId?: string,
		requestId?: string,
	) {
		return this.parseStringWithEnvironmentOverrides(text, data, serviceId, requestId);
	}

	public static resolveVariablesForString(
		text: string,
		data: PickedWorkspaceData,
		serviceId?: string,
		requestId?: string,
	) {
		const snippets = this.parseStringWithEnvironmentOverrides(text, data, serviceId, requestId);
		return snippets.map((snippet) => snippet.value).join('');
	}

	public static resolveVariablesForMappedObject<T extends Record<string, unknown>>(
		object: T,
		context: {
			data: PickedWorkspaceData;
			serviceId?: string;
			requestId?: string;
		},
	) {
		const { data, serviceId, requestId } = context;
		if (!Array.isArray(object)) {
			const newObj: Record<string, unknown> = {};
			Object.keys(object).forEach((key) => {
				const newKey = this.resolveVariablesForString(key, data, serviceId, requestId);
				newObj[newKey] = this.resolveVariableForObjectKey(object, key, context);
			});
			return newObj;
		} else {
			return object.map((_item, index) => this.resolveVariableForObjectKey(object, index, context));
		}
	}

	private static resolveVariableForObjectKey<T extends object, TKey extends keyof T & (string | number)>(
		object: T,
		key: TKey,
		context: {
			data: PickedWorkspaceData;
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

	public static parseStringWithEnvironment(
		text: string | undefined | null,
		envValues: OrderedKeyValuePairs,
	): Snippet[] {
		if (text == null) {
			return [];
		}
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
				resultText.push({ variableName, value: envValues.get(variableName) ?? '' });
				startVariablePos = i + 1;
			}
		}
		const endPiece = { value: text.slice(startVariablePos) };
		if (endPiece.value != '') {
			resultText.push(endPiece);
		}
		return resultText;
	}

	private static parseStringWithEnvironmentOverrides(
		text: string,
		data: PickedWorkspaceData,
		serviceId?: string,
		requestId?: string,
	) {
		const env = this.buildEnvironmentVariables(data, serviceId, requestId);
		return this.parseStringWithEnvironment(text, env);
	}

	public static buildEnvironmentVariables(
		data: PickedWorkspaceData,
		serviceId?: string,
		requestId?: string,
	): OrderedKeyValuePairs {
		const values = new OrderedKeyValuePairs();
		if (data.selectedEnvironment) {
			values.apply(data.environments[data.selectedEnvironment].pairs);
		}
		if (serviceId) {
			const service = data.services[serviceId];
			if (service?.selectedEnvironment) {
				values.apply(service.localEnvironments[service.selectedEnvironment].pairs);
			}
		}
		if (requestId) {
			const request = data.requests[requestId];
			if (request?.environmentOverride) {
				values.apply(request.environmentOverride.pairs);
			}
		}
		return values;
	}
}
