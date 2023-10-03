import { useContext } from 'react';
import { ApplicationDataContext, TabsContext } from '../../App';
import { IconButton, ListItemDecorator, Tab, TabList, Tabs, tabClasses } from '@mui/joy';
import { tabsManager } from '../../managers/TabsManager';
import { log } from '../../utils/logging';
import { keepStringLengthReasonable } from '../../utils/string';
import { TabType } from '../../types/state/state';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import CloseIcon from '@mui/icons-material/Close';

const iconFromTabType: Record<TabType, JSX.Element> = {
	endpoint: <FolderOpenIcon />,
	environment: <FolderOpenIcon />,
	request: <TextSnippetIcon />,
	service: <FolderOpenIcon />,
};

export function TabHeader() {
	const tabsContext = useContext(TabsContext);
	const data = useContext(ApplicationDataContext);
	const { tabs } = tabsContext;

	return (
		<Tabs
			aria-label="tabs"
			size="lg"
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
				disableUnderline
				sx={{
					overflow: 'auto',
					scrollSnapType: 'x mandatory',
					'&::-webkit-scrollbar': { display: 'none' },
					[`& .${tabClasses.root}`]: {
						'&[aria-selected="true"]': {
							color: `primary.500`,
							bgcolor: 'background.surface',
							borderColor: 'divider',
							outline: 'none',
							'&::before': {
								content: '""',
								display: 'block',
								position: 'absolute',
								height: 2,
								bottom: -2,
								left: 0,
								right: 0,
								bgcolor: 'background.surface',
							},
						},
					},
				}}
			>
				{Object.entries(tabs.tabs).map(([tabId, tabType], index) => {
					const tabData = tabsManager.getMapFromTabType(data, tabType)[tabId];

					return (
						<Tab
							indicatorPlacement="top"
							value={tabId}
							key={index}
							sx={{ minWidth: 200, flex: 'none', scrollSnapAlign: 'start' }}
						>
							<ListItemDecorator>{iconFromTabType[tabType]}</ListItemDecorator>
							{keepStringLengthReasonable(tabData?.name)}
							<ListItemDecorator>
								<IconButton
									onClick={(e) => {
										tabsManager.closeTab(tabsContext, tabId);
										e.stopPropagation();
									}}
								>
									<CloseIcon />
								</IconButton>
							</ListItemDecorator>
						</Tab>
					);
				})}
			</TabList>
		</Tabs>
	);
}
