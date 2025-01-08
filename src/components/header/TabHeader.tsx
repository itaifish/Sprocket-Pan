import { useEffect } from 'react';
import { TabPanel, Tabs } from '@mui/joy';
import { useSelector } from 'react-redux';
import { TabRow } from './TabRow';
import { useAppDispatch } from '@/state/store';
import { uiActions } from '@/state/ui/slice';
import { TabContent } from '../panels/TabContent';
import { useScrollbarTheme } from '@/hooks/useScrollbarTheme';
import { selectUiState } from '@/state/ui/selectors';

export function TabHeader() {
	const { tabs, selectedTab } = useSelector(selectUiState);
	const { guttered: scrollbarTheme } = useScrollbarTheme();
	const dispatch = useAppDispatch();
	useEffect(() => {
		document.getElementById(`tab_${selectedTab}`)?.scrollIntoView();
		const fileToScrollTo = document.getElementById(`file_${selectedTab}`);
		fileToScrollTo?.scrollIntoView({ block: 'center' });
	}, [selectedTab]);

	return (
		<Tabs
			size="lg"
			value={selectedTab}
			onChange={(_, newValue) => dispatch(uiActions.setSelectedTab(newValue as string))}
		>
			<TabRow list={tabs} />
			{tabs.map((id, index) => (
				<TabPanel
					value={id}
					key={index}
					sx={{ padding: 0, height: 'calc(100vh - 45px)', overflow: 'auto', ...scrollbarTheme }}
				>
					<TabContent id={id} />
				</TabPanel>
			))}
		</Tabs>
	);
}
