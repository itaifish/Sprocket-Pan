import { Tab, TabList, TabPanel, Tabs } from '@mui/joy';
import { DataTab } from './DataTab';
import { GeneralTab } from './GeneralTab';
import { ActionsTab } from './ActionsTab';
import { DisplayTab } from './DisplayTab';
import { WorkspaceTab, WorkspaceTabProps } from './WorkspaceTab';
import { SettingsTabProps } from './types';
import { useScrollbarTheme } from '@/hooks/useScrollbarTheme';

export function SettingsTabs({ goToWorkspaceSelection, ...tabProps }: SettingsTabProps & Partial<WorkspaceTabProps>) {
	const { average } = useScrollbarTheme();
	const panelStyles = { ...average, height: '100%', overflowY: 'auto' };
	return (
		<Tabs aria-label="Settings Tabs" orientation="vertical" sx={{ height: 'calc(100% - 30px)' }}>
			<TabList>
				<Tab>General</Tab>
				<Tab>Actions</Tab>
				<Tab>Display</Tab>
				<Tab>Data</Tab>
				{goToWorkspaceSelection != null && <Tab>Workspace</Tab>}
			</TabList>
			<TabPanel sx={panelStyles} value={0}>
				<GeneralTab {...tabProps} />
			</TabPanel>
			<TabPanel sx={panelStyles} value={1}>
				<ActionsTab {...tabProps} />
			</TabPanel>
			<TabPanel sx={panelStyles} value={2}>
				<DisplayTab {...tabProps} />
			</TabPanel>
			<TabPanel sx={panelStyles} value={3}>
				<DataTab {...tabProps} />
			</TabPanel>
			{goToWorkspaceSelection != null && (
				<TabPanel sx={panelStyles} value={4}>
					<WorkspaceTab goToWorkspaceSelection={goToWorkspaceSelection} {...tabProps} />
				</TabPanel>
			)}
		</Tabs>
	);
}
