export const SidebarTabs = {
	Workspaces: 'Workspaces',
	Environments: 'Environments',
	Scripts: 'Scripts',
	Services: 'Services',
} as const;

export type SidebarTabs = keyof typeof SidebarTabs;
