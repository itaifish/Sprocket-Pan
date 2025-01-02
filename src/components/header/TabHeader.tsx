import { useEffect, useMemo } from 'react';
import { TabPanel, Tabs } from '@mui/joy';
import { useSelector } from 'react-redux';
import { TabRow } from './TabRow';
import { useAppDispatch } from '@/state/store';
import { selectTabsState } from '@/state/tabs/selectors';
import { tabsActions } from '@/state/tabs/slice';
import { TabContent } from '../panels/TabContent';
import { useScrollbarTheme } from '@/hooks/useScrollbarTheme';

export function TabHeader() {
	const { list, selected } = useSelector(selectTabsState);
	const { guttered: scrollbarTheme } = useScrollbarTheme();
	const dispatch = useAppDispatch();
	useEffect(() => {
		document.getElementById(`tab_${selected}`)?.scrollIntoView();
		const fileToScrollTo = document.getElementById(`file_${selected}`);
		fileToScrollTo?.scrollIntoView({ block: 'center' });
	}, [selected]);

	const listList = useMemo(() => Object.entries(list), [list]);

	return (
		<Tabs
			size="lg"
			value={selected}
			onChange={(_, newValue) => dispatch(tabsActions.setSelectedTab(newValue as string))}
		>
			<TabRow list={list} />
			{listList.map(([tabId, tabType], index) => (
				<TabPanel
					value={tabId}
					key={index}
					sx={{ padding: 0, height: 'calc(100vh - 45px)', overflow: 'auto', ...scrollbarTheme }}
				>
					<TabContent id={tabId} type={tabType} />
				</TabPanel>
			))}
		</Tabs>
	);
}
