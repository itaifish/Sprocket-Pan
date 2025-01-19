import { ItemPrefix } from '@/types/data/item';
import { Endpoint, EndpointRequest, Environment, Script, Service, WorkspaceMetadata } from '@/types/data/workspace';
import { toValidFunctionName } from '@/utils/string';
import { generateSlug } from 'random-word-slugs';
import { v4 } from 'uuid';

/**
 * Creates objects that extend from the Item type (services, endpoints, requests, environments, etc).
 * Assigns the proper & neccessary ID structure (type:uuid).
 */
export class ItemFactory {
	private static id(type: ItemPrefix) {
		return `${type}:${v4()}`;
	}

	static workspace(template?: Partial<WorkspaceMetadata>): WorkspaceMetadata {
		const id = this.id(ItemPrefix.workspace);
		return {
			minidenticon: generateSlug(3),
			name: 'New Workspace',
			description: '',
			...structuredClone(template),
			fileName: template?.fileName ?? id,
			lastModified: new Date().getTime(),
			id,
		};
	}

	static script(template?: Partial<Script>): Script {
		const scriptCallableName = toValidFunctionName(template?.name ?? 'newScript');
		return {
			name: 'New Script',
			content: '',
			scriptCallableName,
			...structuredClone(template),
			id: this.id(ItemPrefix.script),
		};
	}

	static service(template?: Partial<Service>): Service {
		return {
			endpointIds: [],
			localEnvironments: {},
			baseUrl: '',
			version: '1.0.0',
			name: 'New Service',
			description: '',
			...structuredClone(template),
			id: this.id(ItemPrefix.service),
		};
	}

	static environment(template?: Partial<Environment>): Environment {
		return {
			name: 'New Environment',
			pairs: [],
			...structuredClone(template),
			id: this.id(ItemPrefix.environment),
		};
	}

	static endpoint(template?: Partial<Endpoint>): Endpoint {
		return {
			defaultRequest: null,
			serviceId: 'EMPTY',
			description: '',
			baseQueryParams: [],
			baseHeaders: [],
			url: '',
			verb: 'GET',
			name: 'New Endpoint',
			requestIds: [],
			...structuredClone(template),
			id: this.id(ItemPrefix.endpoint),
		};
	}

	static request(template?: Partial<EndpointRequest>): EndpointRequest {
		return {
			name: 'New Request',
			environmentOverride: { pairs: [], id: this.id(ItemPrefix.environment), name: 'Request Environment Override' },
			rawType: 'Text',
			body: '',
			bodyType: 'none',
			queryParams: [],
			headers: [],
			endpointId: 'EMPTY',
			...structuredClone(template),
			id: this.id(ItemPrefix.request),
		};
	}
}
