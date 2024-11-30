import { KeyValuePair, OrderedKeyValuePairs } from '../classes/OrderedKeyValuePairs';
import { Environment, WorkspaceData } from '../types/application-data/application-data';
import { replaceValuesByKey } from '../utils/variables';

export type Snippet = {
	value: string;
	variableName?: string;
};

export type BuildEnvironmentVariablesArgs = Pick<WorkspaceData, 'secrets'> & {
	rootEnv?: Environment | null;
	reqEnv?: Environment | null;
	servEnv?: Environment | null;
	// ensures you don't accidentally pass in WorkspaceData, which technically satisfies the above properties
	environments?: never;
};

export class EnvironmentContextResolver {
	public static stringWithVarsToSnippet(text: string, data: BuildEnvironmentVariablesArgs) {
		return this.parseStringWithEnvironmentOverrides(text, data);
	}

	public static resolveVariablesForString(text: string, data: BuildEnvironmentVariablesArgs) {
		const snippets = this.parseStringWithEnvironmentOverrides(text, data);
		return snippets.map((snippet) => snippet.value).join('');
	}

	public static resolveVariablesForMappedObject<T extends Record<string, unknown>>(
		object: T,
		data: BuildEnvironmentVariablesArgs,
	) {
		if (!Array.isArray(object)) {
			const newObj: Record<string, unknown> = {};
			Object.keys(object).forEach((key) => {
				const newKey = this.resolveVariablesForString(key, data);
				newObj[newKey] = this.resolveVariableForObjectKey(object, key, data);
			});
			return newObj;
		} else {
			return object.map((_item, index) => this.resolveVariableForObjectKey(object, index, data));
		}
	}

	private static resolveVariableForObjectKey<T extends object, TKey extends keyof T & (string | number)>(
		object: T,
		key: TKey,
		data: BuildEnvironmentVariablesArgs,
	): T[TKey] {
		const oldValue = object[key];
		if (oldValue === null) {
			return null as T[TKey];
		} else if (typeof oldValue === 'object') {
			if (Array.isArray(oldValue)) {
				return oldValue.map((_val, index) => this.resolveVariableForObjectKey(oldValue, index, data)) as T[TKey];
			} else {
				return this.resolveVariablesForMappedObject(oldValue as T[keyof T] & Record<string, unknown>, data) as T[TKey];
			}
		} else if (typeof oldValue === 'string') {
			return this.resolveVariablesForString(oldValue, data) as T[TKey];
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

	private static parseStringWithEnvironmentOverrides(text: string, data: BuildEnvironmentVariablesArgs) {
		const env = this.buildEnvironmentVariables(data);
		return this.parseStringWithEnvironment(text, env);
	}

	private static applyLayerOntoEnv(
		layer: KeyValuePair[],
		variables: OrderedKeyValuePairs,
		replacer: OrderedKeyValuePairs,
	) {
		const orderedLayer = new OrderedKeyValuePairs(layer);
		const replacerPairs = replacer.toArray();
		orderedLayer.transformValues((val) => (val == null ? val : replaceValuesByKey(val, replacerPairs)));
		variables.apply(orderedLayer);
		replacer.apply(orderedLayer);
	}

	public static buildEnvironmentVariables({
		secrets,
		rootEnv,
		servEnv,
		reqEnv,
	}: BuildEnvironmentVariablesArgs): OrderedKeyValuePairs {
		const replacer = new OrderedKeyValuePairs(secrets);
		const variables = new OrderedKeyValuePairs();
		[rootEnv, servEnv, reqEnv].forEach((env) => {
			if (env?.pairs?.length) {
				this.applyLayerOntoEnv(env.pairs, variables, replacer);
			}
		});
		return variables;
	}
}
