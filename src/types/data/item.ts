import { WorkspaceItemType } from './workspace';

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

export const ItemPrefix = {
	endpoint: 'end',
	service: 'srv',
	request: 'req',
	script: 'scr',
	environment: 'env',
	workspace: 'wrk',
} as const;

export type ItemPrefix = (typeof ItemPrefix)[keyof typeof ItemType];

export const ItemProperty: { [key in ItemType]: WorkspaceItemType | 'workspaces' } = {
	endpoint: 'endpoints',
	service: 'services',
	request: 'requests',
	script: 'scripts',
	environment: 'environments',
	workspace: 'workspaces',
};
