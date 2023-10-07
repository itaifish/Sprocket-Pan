import { createContext, useEffect, useState } from 'react';
import { SideDrawer } from './components/molecules/file-system/SideDrawer';
import { applicationDataManager } from './managers/ApplicationDataManager';
import { StateContext, TabType } from './types/state/state';
import { log } from './utils/logging';
import { TabHeader } from './components/molecules/tabs/TabHeader';
import { Box, Grid } from '@mui/joy';
import { SideDrawerActionButtons } from './components/molecules/file-system/SideDrawerActionButtons';
import { NavigableServicesFileSystem } from './components/molecules/file-system/NavigableServicesFileSystem';

export const DrawerContext = createContext<StateContext<boolean, 'drawerOpen'>>({
	drawerOpen: true,
	setDrawerOpen: null as unknown as React.Dispatch<React.SetStateAction<boolean>>,
});
export const ApplicationDataContext = createContext(applicationDataManager.getApplicationData());

type TabsType = { tabs: Record<string, TabType>; selected: string | null };
export type TabsContextType = StateContext<TabsType, 'tabs'>;
export const TabsContext = createContext<TabsContextType>(null as unknown as TabsContextType);

type ServicesSearchContextType = StateContext<string, 'searchText'>;
export const ServicesSearchContext = createContext<ServicesSearchContextType>(
	null as unknown as ServicesSearchContextType,
);

function App() {
	const [drawerOpen, setDrawerOpen] = useState(true);
	const [data, setData] = useState(applicationDataManager.getApplicationData());
	useEffect(() => {
		const event = () => {
			log.info(`update seen`);
			setData(applicationDataManager.getApplicationData());
		};
		applicationDataManager.on('update', event);
		return () => {
			applicationDataManager.off('update', event);
		};
	}, []);

	const [tabs, setTabs] = useState<TabsType>({ tabs: {}, selected: null });
	useEffect(() => document.getElementById(`tab_${tabs.selected}`)?.scrollIntoView(), [tabs]);
	const [searchText, setSearchText] = useState('');
	return (
		<div className="container" style={{ height: '100vh' }}>
			<DrawerContext.Provider value={{ drawerOpen, setDrawerOpen }}>
				<ApplicationDataContext.Provider value={data}>
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
												<SideDrawerActionButtons />
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
				</ApplicationDataContext.Provider>
			</DrawerContext.Provider>
		</div>
	);
}

export default App;
