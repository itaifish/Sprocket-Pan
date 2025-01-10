export const ItemType = {
	endpoint: 'endpoint',
	service: 'service',
	request: 'request',
	script: 'script',
	environment: 'environment',
	workspace: 'workspace',
} as const;

export type ItemType = (typeof ItemType)[keyof typeof ItemType];

export interface Item {
	id: string;
	name: string;
}

export const ShortItemType = {
	endpoint: 'end',
	service: 'srv',
	request: 'req',
	script: 'scr',
	environment: 'env',
	workspace: 'wrk',
} as const;

export type ShortItemType = (typeof ShortItemType)[keyof typeof ItemType];
