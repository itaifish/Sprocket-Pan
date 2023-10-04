import { useContext } from 'react';
import { ApplicationDataContext, TabsContext } from '../../App';
import {
	Chip,
	Grid,
	IconButton,
	ListItemDecorator,
	Sheet,
	Stack,
	Tab,
	TabList,
	TabPanel,
	Tabs,
	tabClasses,
} from '@mui/joy';
import { tabsManager } from '../../managers/TabsManager';
import { log } from '../../utils/logging';
import { keepStringLengthReasonable } from '../../utils/string';
import { TabType } from '../../types/state/state';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import CloseIcon from '@mui/icons-material/Close';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';

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
				id="tabScroll"
				sx={{
					overflow: 'auto',
					scrollSnapType: 'x mandatory',
					'&::-webkit-scrollbar': { display: 'none' },
					[`& .${tabClasses.root}`]: {
						'&[aria-selected="true"]': {
							color: `secondary.500`,
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
				<div style={{ position: 'fixed', zIndex: 500, paddingTop: '45px' }}>
					<IconButton
						size="lg"
						color="primary"
						variant="soft"
						sx={{ boxShadow: '5px 5px 5px black' }}
						onClick={() => {
							document.getElementById('tabScroll')?.scrollBy({ left: -50, behavior: 'instant' });
						}}
					>
						<ArrowLeftIcon />
					</IconButton>
				</div>
				{Object.entries(tabs.tabs).map(([tabId, tabType], index) => {
					const tabData = tabsManager.getMapFromTabType(data, tabType)[tabId];

					return (
						<Tab
							indicatorPlacement="top"
							value={tabId}
							key={index}
							id={`tab_${tabId}`}
							sx={{ minWidth: 230, flex: 'none', scrollSnapAlign: 'start' }}
						>
							<ListItemDecorator>{iconFromTabType[tabType]}</ListItemDecorator>
							{keepStringLengthReasonable(tabData?.name, 20)}
							<ListItemDecorator>
								<IconButton
									color="danger"
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

				<div style={{ position: 'fixed', zIndex: 500, paddingTop: '45px', right: 40 }}>
					<IconButton
						size="lg"
						color="primary"
						variant="soft"
						sx={{ boxShadow: '5px 5px 5px black' }}
						onClick={() => {
							document.getElementById('tabScroll')?.scrollBy({ left: 50, behavior: 'instant' });
						}}
					>
						<ArrowRightIcon />
					</IconButton>
				</div>
			</TabList>
			{Object.keys(tabs.tabs).map((tabId, index) => (
				<TabPanel value={tabId} key={index}>
					<Sheet sx={{ height: '100%', boxSizing: 'content-box' }}>{tabId}</Sheet>
				</TabPanel>
			))}
		</Tabs>
	);
}
