import { useContext, useMemo } from 'react';
import { ApplicationDataContext, TabsContext } from '../../App';
import { ListItemDecorator, Tab, TabList, Tabs, tabClasses } from '@mui/joy';
import { tabsManager } from '../../managers/TabsManager';
import { log } from '../../utils/logging';

export function TabHeader() {
	const tabsContext = useContext(TabsContext);
	const data = useContext(ApplicationDataContext);
	const { tabs } = tabsContext;

	return (
		<Tabs
			aria-label="tabs"
			value={tabs.selected}
			onChange={(_event, newValue) => {
				const newTabId = newValue as string;
				tabsManager.selectTab(tabsContext, newTabId, tabs.tabs[newTabId]);
			}}
			sx={{ width: '100%' }}
		>
			<TabList
				tabFlex="1"
				sticky="top"
				underlinePlacement="bottom"
				variant="soft"
				sx={{
					[`& .${tabClasses.root}`]: {
						'&[aria-selected="true"]': {
							color: `primary.500`,
							bgcolor: (theme) => `rgba(${theme.vars.palette.neutral.darkChannel} / 0.8)`,
							borderColor: 'divider',
							'&::before': {
								content: '""',
								display: 'block',
								position: 'absolute',
								height: 2,
								bottom: -2,
								left: 0,
								right: 0,
								bgcolor: (theme) => `rgba(${theme.vars.palette.neutral.darkChannel} / 0.8)`,
							},
						},
					},
				}}
			>
				{Object.entries(tabs.tabs).map(([tabId, tabType], index) => {
					const tabData = tabsManager.getMapFromTabType(data, tabType)[tabId];

					return (
						<Tab indicatorPlacement="bottom" key={index} value={tabId}>
							<ListItemDecorator>{/* <GoogleIcon /> */}</ListItemDecorator>
							{tabData?.name}
						</Tab>
					);
				})}
			</TabList>
		</Tabs>
	);
}
