import { useEffect, useMemo } from 'react';
import { TabPanel, Tabs } from '@mui/joy';
import { useSelector } from 'react-redux';
import { TabRow } from './TabRow';
import { useAppDispatch } from '@/state/store';
import { uiActions } from '@/state/ui/slice';
import { TabContent } from '../panels/TabContent';
import { useScrollbarTheme } from '@/hooks/useScrollbarTheme';
import { selectUiState } from '@/state/ui/selectors';

export function TabHeader() {
	const { list, selected } = useSelector(selectUiState);
	const { guttered: scrollbarTheme } = useScrollbarTheme();
	const dispatch = useAppDispatch();
	useEffect(() => {
		document.getElementById(`tab_${selected}`)?.scrollIntoView();
		const fileToScrollTo = document.getElementById(`file_${selected}`);
		fileToScrollTo?.scrollIntoView({ block: 'center' });
	}, [selected]);

	const listList = useMemo(() => Object.entries(list), [list]);

	return (
		<Tabs size="lg" value={selected} onChange={(_, newValue) => dispatch(uiActions.setSelectedTab(newValue as string))}>
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
