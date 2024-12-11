import { Tab, TabList, TabPanel, Tabs } from '@mui/joy';
import { DataTab, DataTabProps } from './DataTab';
import { GeneralTab } from './GeneralTab';
import { ActionsTab } from './ActionsTab';
import { ThemeTab } from './ThemeTab';

export function SettingsTabs({ settings, onChange, ...dataProps }: DataTabProps) {
	return (
		<Tabs aria-label="Settings Tabs" orientation="vertical" sx={{ height: 'calc(100% - 30px)' }}>
			<TabList>
				<Tab>General</Tab>
				<Tab>Actions</Tab>
				<Tab>Theme</Tab>
				<Tab>Data</Tab>
			</TabList>
			<TabPanel sx={{ height: '100%', overflowY: 'auto' }} value={0}>
				<GeneralTab settings={settings} onChange={onChange} />
			</TabPanel>
			<TabPanel sx={{ height: '100%', overflowY: 'auto' }} value={1}>
				<ActionsTab settings={settings} onChange={onChange} />
			</TabPanel>
			<TabPanel sx={{ height: '100%', overflowY: 'auto' }} value={2}>
				<ThemeTab settings={settings} onChange={onChange} />
			</TabPanel>
			<TabPanel sx={{ height: '100%', overflowY: 'auto' }} value={3}>
				<DataTab settings={settings} onChange={onChange} {...dataProps} />
			</TabPanel>
		</Tabs>
	);
}
