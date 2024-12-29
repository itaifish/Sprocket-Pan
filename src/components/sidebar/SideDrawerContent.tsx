import { EnvironmentsFileSystem } from './file-system/environment/EnvironmentsFileSystem';
import { ScriptsFileSystem } from './file-system/script/ScriptsFileSystem';
import { ServicesFileSystem } from './file-system/service/ServicesFileSystem';
import { WorkspacesFileSystem } from './file-system/workspace/WorkspacesFileSystem';
import { SidebarTabs } from './types';

interface SideDrawerContentProps {
	tab: SidebarTabs;
}

export function SideDrawerContent({ tab }: SideDrawerContentProps) {
	switch (tab) {
		case SidebarTabs.Workspaces:
			return <WorkspacesFileSystem />;
		case SidebarTabs.Environments:
			return <EnvironmentsFileSystem />;
		case SidebarTabs.Scripts:
			return <ScriptsFileSystem />;
		case SidebarTabs.Services:
			return <ServicesFileSystem />;
	}
}
