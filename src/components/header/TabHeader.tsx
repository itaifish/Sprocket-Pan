import { useEffect } from 'react';
import { Sheet, TabPanel, Tabs } from '@mui/joy';

import { useSelector } from 'react-redux';
import { useAppDispatch } from '../../state/store';
import { selectTabsState } from '../../state/tabs/selectors';
import { setSelectedTab } from '../../state/tabs/slice';
import { TabContent } from '../panels/TabContent';
import { TabRow } from './TabRow';

export function TabHeader() {
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
				<TabRow list={list} />
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
