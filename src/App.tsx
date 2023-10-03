import { createContext, useEffect, useState } from 'react';
import { ThemeToggleButton } from './components/atoms/buttons/ThemeToggleButton';
import { SideDrawer } from './components/molecules/SideDrawer';
import { applicationDataManager } from './managers/ApplicationDataManager';
import { NewServiceButton } from './components/atoms/buttons/NewServiceButton';
import { NavigableServicesFileSystem } from './components/molecules/NavigableServicesFileSystem';
import { StateContext, TabType } from './types/state/state';
import { log } from './utils/logging';
import { TabHeader } from './components/molecules/TabHeader';
import { Stack } from '@mui/joy';

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
	const [searchText, setSearchText] = useState('');
	return (
		<div className="container">
			<DrawerContext.Provider value={{ drawerOpen, setDrawerOpen }}>
				<ApplicationDataContext.Provider value={data}>
					<TabsContext.Provider value={{ tabs, setTabs }}>
						<ServicesSearchContext.Provider value={{ searchText, setSearchText }}>
							<Stack direction={'row'}>
								{drawerOpen && (
									<SideDrawer>
										<ThemeToggleButton />
										<NewServiceButton />
										<NavigableServicesFileSystem />
									</SideDrawer>
								)}
								<TabHeader />
							</Stack>
						</ServicesSearchContext.Provider>
					</TabsContext.Provider>
				</ApplicationDataContext.Provider>
			</DrawerContext.Provider>
		</div>
	);
}

export default App;
