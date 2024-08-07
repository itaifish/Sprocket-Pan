import { useEffect } from 'react';
import { IconButton, ListItemDecorator, Sheet, Tab, TabList, TabPanel, Tabs, tabClasses } from '@mui/joy';
import CloseIcon from '@mui/icons-material/Close';

import { useSelector } from 'react-redux';
import { TabType } from '../../types/state/state';
import { ApplicationData, Environment, iconFromTabType } from '../../types/application-data/application-data';
import {
	selectEnvironments,
	selectServices,
	selectRequests,
	selectEndpoints,
	selectScripts,
} from '../../state/active/selectors';
import { useAppDispatch } from '../../state/store';
import { selectTabsState } from '../../state/tabs/selectors';
import { setSelectedTab, closeTab } from '../../state/tabs/slice';
import { keepStringLengthReasonable } from '../../utils/string';
import { TabContent } from '../panels/TabContent';

function getMapFromTabType<TTabType extends TabType>(data: Pick<ApplicationData, `${TTabType}s`>, tabType: TTabType) {
	return data[`${tabType}s`];
}

export function TabHeader() {
	const environments = useSelector(selectEnvironments);
	const services = useSelector(selectServices);
	const requests = useSelector(selectRequests);
	const endpoints = useSelector(selectEndpoints);
	const scripts = useSelector(selectScripts);
	const { list, selected } = useSelector(selectTabsState);
	const dispatch = useAppDispatch();
	useEffect(() => {
		document.getElementById(`tab_${selected}`)?.scrollIntoView();
		const fileToScrollTo = document.getElementById(`file_${selected}`);
		fileToScrollTo?.scrollIntoView({ block: 'center' });
	}, [selected]);

	return (
		<div style={{ width: '100%', height: '100%', overflowY: 'auto', maxHeight: '100vh' }}>
			<Tabs
				aria-label="tabs"
				size="lg"
				value={selected}
				onChange={(_event, newValue) => {
					const newTabId = newValue as string;
					dispatch(setSelectedTab(newTabId));
				}}
			>
				<TabList
					tabFlex="1"
					sticky="top"
					underlinePlacement="bottom"
					variant="soft"
					disableUnderline
					id="tabScroll"
					sx={{
						overflowX: 'auto',
						overflowY: 'hidden',
						scrollSnapType: 'x mandatory',
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
					{Object.entries(list).map(([tabId, tabType], index) => {
						const tabData = getMapFromTabType({ environments, requests, services, endpoints, scripts }, tabType)[tabId];
						const name = tabData?.name ?? (tabData as Environment)?.__name ?? '';
						return (
							<Tab
								indicatorPlacement="top"
								value={tabId}
								key={index}
								id={`tab_${tabId}`}
								sx={{ minWidth: 230, flex: 'none', scrollSnapAlign: 'start' }}
							>
								<ListItemDecorator>{iconFromTabType[tabType]}</ListItemDecorator>
								{keepStringLengthReasonable(name, 20)}
								<ListItemDecorator>
									<IconButton
										color="danger"
										onClick={(e) => {
											dispatch(closeTab(tabId));
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
				{Object.entries(list).map(([tabId, tabType], index) => (
					<TabPanel value={tabId} key={index}>
						<Sheet sx={{ boxSizing: 'content-box' }}>
							<TabContent id={tabId} type={tabType} />
						</Sheet>
					</TabPanel>
				))}
			</Tabs>
		</div>
	);
}
