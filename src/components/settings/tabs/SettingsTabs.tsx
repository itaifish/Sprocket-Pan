import { Tab, TabList, TabPanel, Tabs } from '@mui/joy';
import { DataTab, DataTabProps } from './DataTab';
import { GeneralTab } from './GeneralTab';
import { ActionsTab } from './ActionsTab';
import { ThemeTab } from './ThemeTab';
import { WorkspaceTab } from './WorkspaceTab';

export function SettingsTabs({ goToWorkspaceSelection, ...tabProps }: DataTabProps) {
	return (
		<Tabs aria-label="Settings Tabs" orientation="vertical" sx={{ height: 'calc(100% - 30px)' }}>
			<TabList>
				<Tab>General</Tab>
				<Tab>Actions</Tab>
				<Tab>Theme</Tab>
				<Tab>Data</Tab>
				<Tab>Workspace</Tab>
			</TabList>
			<TabPanel sx={{ height: '100%', overflowY: 'auto' }} value={0}>
				<GeneralTab {...tabProps} />
			</TabPanel>
			<TabPanel sx={{ height: '100%', overflowY: 'auto' }} value={1}>
				<ActionsTab {...tabProps} />
			</TabPanel>
			<TabPanel sx={{ height: '100%', overflowY: 'auto' }} value={2}>
				<ThemeTab {...tabProps} />
			</TabPanel>
			<TabPanel sx={{ height: '100%', overflowY: 'auto' }} value={3}>
				<DataTab goToWorkspaceSelection={goToWorkspaceSelection} {...tabProps} />
			</TabPanel>
			<TabPanel sx={{ height: '100%', overflowY: 'auto' }} value={4}>
				<WorkspaceTab {...tabProps} />
			</TabPanel>
		</Tabs>
	);
}
