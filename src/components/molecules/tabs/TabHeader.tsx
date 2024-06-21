import { useCallback, useEffect, useState } from 'react';
import { IconButton, ListItemDecorator, Sheet, Tab, TabList, TabPanel, Tabs, tabClasses } from '@mui/joy';
import { keepStringLengthReasonable } from '../../../utils/string';
import CloseIcon from '@mui/icons-material/Close';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import { TabContent } from './TabContent';
import { ApplicationData, Environment, iconFromTabType } from '../../../types/application-data/application-data';
import { useSelector } from 'react-redux';
import { selectActiveState } from '../../../state/active/selectors';
import { selectTabsState } from '../../../state/tabs/selectors';
import { useAppDispatch } from '../../../state/store';
import { closeTab, setSelectedTab } from '../../../state/tabs/slice';
import { TabType } from '../../../types/state/state';

function getMapFromTabType(data: ApplicationData, tabType: TabType) {
	switch (tabType) {
		case 'environment':
			return data.environments;
		case 'request':
			return data.requests;
		case 'service':
			return data.services;
		case 'endpoint':
		default:
			return data.endpoints;
	}
}

export function TabHeader() {
	const data = useSelector(selectActiveState);
	const { list, selected } = useSelector(selectTabsState);
	const [disabled, setDisabled] = useState({ left: false, right: false });
	const dispatch = useAppDispatch();
	const getTabScroll = () => document.getElementById('tabScroll');
	useEffect(() => {
		document.getElementById(`tab_${selected}`)?.scrollIntoView();
	}, [selected]);
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
	}, [list, selected]);
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
					{Object.entries(list).map(([tabId, tabType], index) => {
						const tabData = getMapFromTabType(data, tabType)[tabId];

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
