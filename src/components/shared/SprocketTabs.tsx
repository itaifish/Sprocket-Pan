import { Tab, TabList, TabPanel, Tabs } from '@mui/joy';
import { useState } from 'react';

interface SprocketTab {
	content: React.ReactNode;
	title: string;
}

interface SprocketTabsProps {
	tabs: SprocketTab[];
}

export function SprocketTabs({ tabs }: SprocketTabsProps) {
	const [tab, setTab] = useState(0);
	return (
		<Tabs aria-label="tabs" size="lg" value={tab} onChange={(_event, newValue) => setTab((newValue ?? 0) as number)}>
			<TabList color="primary">
				{tabs.map(({ title }, index) => (
					<Tab color={index === tab ? 'primary' : 'neutral'} value={index} key={index}>
						{title}
					</Tab>
				))}
			</TabList>
			{tabs.map((tab, index) => (
				<TabPanel key={index} value={index}>
					{tab.content}
				</TabPanel>
			))}
		</Tabs>
	);
}
