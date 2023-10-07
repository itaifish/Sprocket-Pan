import { useCallback, useContext, useEffect, useState } from 'react';
import { ApplicationDataContext, TabsContext } from '../../../App';
import { IconButton, ListItemDecorator, Sheet, Tab, TabList, TabPanel, Tabs, tabClasses } from '@mui/joy';
import { tabsManager } from '../../../managers/TabsManager';
import { keepStringLengthReasonable } from '../../../utils/string';
import { TabType } from '../../../types/state/state';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import CloseIcon from '@mui/icons-material/Close';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import { TabContent } from './TabContent';
import { Environment } from '../../../types/application-data/application-data';
import TableChartIcon from '@mui/icons-material/TableChart';

const iconFromTabType: Record<TabType, JSX.Element> = {
	endpoint: <FolderOpenIcon />,
	environment: <TableChartIcon />,
	request: <TextSnippetIcon />,
	service: <FolderOpenIcon />,
};

export function TabHeader() {
	const tabsContext = useContext(TabsContext);
	const data = useContext(ApplicationDataContext);
	const { tabs } = tabsContext;
	const [disabled, setDisabled] = useState({ left: false, right: false });
	const getTabScroll = () => document.getElementById('tabScroll');
	const validateScroll = useCallback(() => {
		const scrollEl = getTabScroll();
		if (!scrollEl) {
			setDisabled({ left: true, right: true });
			return;
		}
		let left = false;
		let right = false;
		if (scrollEl.scrollLeft <= 0) {
			left = true;
		}
		if (scrollEl.scrollLeft >= scrollEl.scrollWidth - scrollEl.clientWidth) {
			right = true;
		}
		setDisabled({ left, right });
	}, []);

	useEffect(() => {
		const tabScroll = getTabScroll();
		tabScroll?.addEventListener('scroll', () => {
			validateScroll();
		});
	}, []);

	useEffect(() => {
		validateScroll();
	}, [tabs]);
	return (
		<Tabs
			aria-label="tabs"
			size="lg"
			value={tabs.selected}
			onChange={(_event, newValue) => {
				const newTabId = newValue as string;
				tabsManager.selectTab(tabsContext, newTabId, tabs.tabs[newTabId]);
			}}
			sx={{ width: '100%', height: '100%', overflow: 'hidden' }}
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
							getTabScroll()?.scrollBy({ left: -50, behavior: 'instant' });
						}}
						disabled={disabled.left}
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
							{keepStringLengthReasonable(tabData?.name ?? (tabData as Environment)?.__name ?? '', 20)}
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
						disabled={disabled.right}
					>
						<ArrowRightIcon />
					</IconButton>
				</div>
			</TabList>
			{Object.entries(tabs.tabs).map(([tabId, tabType], index) => (
				<TabPanel value={tabId} key={index}>
					<Sheet sx={{ boxSizing: 'content-box' }}>
						<TabContent id={tabId} type={tabType} />
					</Sheet>
				</TabPanel>
			))}
		</Tabs>
	);
}
