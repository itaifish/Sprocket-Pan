import { useEffect, useMemo } from 'react';
import { Sheet, TabPanel, Tabs } from '@mui/joy';

import { useSelector } from 'react-redux';
import { useAppDispatch } from '../../state/store';
import { selectTabsState } from '../../state/tabs/selectors';
import { TabContent } from '../panels/TabContent';
import { TabRow } from './TabRow';
import { tabsActions } from '../../state/tabs/slice';

export function TabHeader() {
	const { list, selected } = useSelector(selectTabsState);
	const dispatch = useAppDispatch();
	useEffect(() => {
		document.getElementById(`tab_${selected}`)?.scrollIntoView();
		const fileToScrollTo = document.getElementById(`file_${selected}`);
		fileToScrollTo?.scrollIntoView({ block: 'center' });
	}, [selected]);

	const listList = useMemo(() => Object.entries(list), [list]);

	return (
		<>
			{listList.length !== 0 && (
				<Tabs
					aria-label="tabs"
					size="lg"
					value={selected}
					onChange={(_event, newValue) => {
						const newTabId = newValue as string;
						dispatch(tabsActions.setSelectedTab(newTabId));
					}}
					sx={{ minHeight: '100%' }}
				>
					<TabRow list={list} />
					{listList.map(([tabId, tabType], index) => (
						<TabPanel value={tabId} key={index}>
							<Sheet>
								<TabContent id={tabId} type={tabType} />
							</Sheet>
						</TabPanel>
					))}
				</Tabs>
			)}
		</>
	);
}
