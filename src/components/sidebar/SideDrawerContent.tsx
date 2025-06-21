import { Sheet, Stack } from '@mui/joy';
import { EnvironmentsFileSystem } from './file-system/environment/EnvironmentsFileSystem';
import { ScriptsFileSystem } from './file-system/script/ScriptsFileSystem';
import { ServicesFileSystem } from './file-system/service/ServicesFileSystem';
import { WorkspacesFileSystem } from './file-system/workspace/WorkspacesFileSystem';
import { SidebarTabs } from './types';

const tabs = [
	{ content: <WorkspacesFileSystem />, value: SidebarTabs.Workspaces },
	{ content: <EnvironmentsFileSystem />, value: SidebarTabs.Environments },
	{ content: <ScriptsFileSystem />, value: SidebarTabs.Scripts },
	{ content: <ServicesFileSystem />, value: SidebarTabs.Services },
];

interface SideDrawerContentProps {
	tab: SidebarTabs;
}

export function SideDrawerContent({ tab }: SideDrawerContentProps) {
	return tabs.map(({ value, content }) => (
		<Stack key={value} component={Sheet} display={tab === value ? 'inherit' : 'none'} minHeight="1px" flex={1}>
			{content}
		</Stack>
	));
}
