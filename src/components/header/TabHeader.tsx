import { useEffect } from 'react';
import { Box, Stack, TabPanel, Tabs, useTheme } from '@mui/joy';
import { useSelector } from 'react-redux';
import { TabRow } from './TabRow';
import { useAppDispatch } from '@/state/store';
import { uiActions } from '@/state/ui/slice';
import { TabContent } from '../panels/TabContent';
import { useScrollbarTheme } from '@/hooks/useScrollbarTheme';
import { selectUiState } from '@/state/ui/selectors';
import { SprocketPanSvg } from '@/assets/icons/brands/SprocketPan';
import { selectSettings } from '@/state/active/selectors';

export function TabHeader() {
	const { tabs, selectedTab } = useSelector(selectUiState);
	const { guttered: scrollbarTheme } = useScrollbarTheme();
	const settings = useSelector(selectSettings);
	const theme = useTheme();
	const dispatch = useAppDispatch();
	useEffect(() => {
		document.getElementById(`tab_${selectedTab}`)?.scrollIntoView();
		const fileToScrollTo = document.getElementById(`file_${selectedTab}`);
		fileToScrollTo?.scrollIntoView({ block: 'center' });
	}, [selectedTab]);

	return (
		<>
			<Box height="0" width="100%" position="relative">
				<Stack
					alignItems="center"
					justifyContent="center"
					position="absolute"
					sx={{ height: '100vh', width: '100%', overflow: 'hidden' }}
				>
					<SprocketPanSvg
						style={{
							width: 'auto',
							minHeight: '600px',
							height: '80%',
							opacity: settings.theme.decoration.opacity,
							fill: theme.palette.primary.outlinedActiveBg,
							stroke: theme.palette.primary.softActiveBg,
							strokeWidth: '5px',
						}}
					/>
				</Stack>
			</Box>
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
		</>
	);
}
