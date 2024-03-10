import { Box, Grid, Card, Typography } from '@mui/joy';
import { useState, useEffect } from 'react';
import { TabsType, TabsContext, ServicesSearchContext, DrawerContext } from '../../managers/GlobalContextManager';
import { SearchInputField } from '../atoms/SearchInputField';
import { NavigableServicesFileSystem } from '../molecules/file-system/NavigableServicesFileSystem';
import { SideDrawer } from '../molecules/file-system/SideDrawer';
import { SideDrawerActionButtons } from '../molecules/file-system/SideDrawerActionButtons';
import { TabHeader } from '../molecules/tabs/TabHeader';
import { useSelector } from 'react-redux';
import { selectActiveWorkspace } from '../../state/workspaces/selectors';

export function Workspace() {
	const [drawerOpen, setDrawerOpen] = useState(true);
	const [tabs, setTabs] = useState<TabsType>({ tabs: {}, selected: null });
	useEffect(() => document.getElementById(`tab_${tabs.selected}`)?.scrollIntoView(), [tabs]);
	const [searchText, setSearchText] = useState('');
	const activeWorkspace = useSelector(selectActiveWorkspace);

	return (
		<DrawerContext.Provider value={{ drawerOpen, setDrawerOpen }}>
			<TabsContext.Provider value={{ tabs, setTabs }}>
				<ServicesSearchContext.Provider value={{ searchText, setSearchText }}>
					<Box
						sx={{
							minHeight: '100vh',
							maxWidth: '100vw',
						}}
					>
						<Grid container spacing={0}>
							<Grid xs={'auto'}>
								{drawerOpen && (
									<SideDrawer>
										<Card sx={{ position: 'fixed', zIndex: 120 }}>
											<SideDrawerActionButtons />
											<SearchInputField searchText={searchText} setSearchText={setSearchText} />
										</Card>
										<Typography sx={{ paddingTop: '200px', textAlign: 'center' }} level="h3">
											{activeWorkspace?.name ?? 'Sprocket Pan'}
										</Typography>
										<NavigableServicesFileSystem />
									</SideDrawer>
								)}
							</Grid>
							<Grid xs={true}>
								<TabHeader />
							</Grid>
						</Grid>
					</Box>
				</ServicesSearchContext.Provider>
			</TabsContext.Provider>
		</DrawerContext.Provider>
	);
}
