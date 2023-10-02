import { createContext, useEffect, useState } from 'react';
import { ThemeToggleButton } from './components/atoms/buttons/ThemeToggleButton';
import { SideDrawer } from './components/molecules/SideDrawer';
import { applicationDataManager } from './managers/ApplicationDataManager';
import { NewServiceButton } from './components/atoms/buttons/NewServiceButton';
import { NavigableServicesFileSystem } from './components/molecules/NavigableServicesFileSystem';
import { SelectedRequest, StateContext } from './types/state/state';
import { log } from './utils/logging';

export const DrawerContext = createContext<StateContext<boolean, 'drawerOpen'>>({
	drawerOpen: true,
	setDrawerOpen: null as unknown as React.Dispatch<React.SetStateAction<boolean>>,
});
export const ApplicationDataContext = createContext(applicationDataManager.getApplicationData());
type SelectedRequestContextType = StateContext<SelectedRequest | null, 'selectedRequest'>;
export const SelectedRequestContext = createContext<SelectedRequestContextType>(
	null as unknown as SelectedRequestContextType,
);

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

	const [selectedRequest, setSelectedRequest] = useState<SelectedRequest | null>(null);
	return (
		<div className="container">
			<DrawerContext.Provider value={{ drawerOpen, setDrawerOpen }}>
				<ApplicationDataContext.Provider value={data}>
					<SelectedRequestContext.Provider value={{ selectedRequest, setSelectedRequest }}>
						{drawerOpen && (
							<SideDrawer>
								<ThemeToggleButton />
								<NewServiceButton />
								<NavigableServicesFileSystem />
							</SideDrawer>
						)}
					</SelectedRequestContext.Provider>
				</ApplicationDataContext.Provider>
			</DrawerContext.Provider>
		</div>
	);
}

export default App;
