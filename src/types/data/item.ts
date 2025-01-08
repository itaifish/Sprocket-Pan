export const ItemType = {
	endpoint: 'endpoint',
	service: 'service',
	request: 'request',
	script: 'script',
	environment: 'environment',
	workspace: 'workspace',
} as const;

export type ItemType = keyof typeof ItemType;

export interface Item {
	id: string;
	name: string;
}
