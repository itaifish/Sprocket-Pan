import { Tab, TabList, TabPanel, Tabs } from '@mui/joy';
import { SxProps } from '@mui/joy/styles/types';
import { useState } from 'react';

interface SprocketTab {
	content: React.ReactNode;
	title: string;
}

interface SprocketTabsProps {
	tabs: SprocketTab[];
	sx?: SxProps;
}

export function SprocketTabs({ tabs, sx }: SprocketTabsProps) {
	const [tab, setTab] = useState(0);
	return (
		<Tabs
			aria-label="tabs"
			size="lg"
			value={tab}
			onChange={(_event, newValue) => setTab((newValue ?? 0) as number)}
			sx={{ maxWidth: '100%', ...sx }}
		>
			<TabList color="primary" sx={{ overflowX: 'auto', overflowY: 'hidden', maxWidth: '100%' }}>
				{tabs.map(({ title }, index) => (
					<Tab sx={{ minWidth: 'fit-content' }} color={index === tab ? 'primary' : 'neutral'} value={index} key={index}>
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
