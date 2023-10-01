import { createContext, useState } from 'react';
import { ThemeToggleButton } from './components/atoms/buttons/ThemeToggleButton';
import { SideDrawer } from './components/molecules/SideDrawer';
import { applicationDataManager } from './managers/ApplicationDataManager';
import { NewServiceButton } from './components/atoms/buttons/NewServiceButton';
import { NavigableServicesFileSystem } from './components/molecules/NavigableServicesFileSystem';
import { SelectedRequest } from './types/state/state';

export const DrawerContext = createContext<{
	drawerOpen: boolean;
	setDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}>({
	drawerOpen: true,
	setDrawerOpen: null as unknown as React.Dispatch<React.SetStateAction<boolean>>,
});
export const ApplicationDataContext = createContext(applicationDataManager.getApplicationData());
type SelectedRequestContextType = {
	selectedRequest: SelectedRequest | null;
	setSelectedRequest: React.Dispatch<React.SetStateAction<SelectedRequest | null>>;
};
export const SelectedRequestContext = createContext<SelectedRequestContextType>(
	null as unknown as SelectedRequestContextType,
);
function App() {
	const [drawerOpen, setDrawerOpen] = useState(true);
	const [data, setData] = useState(applicationDataManager.getApplicationData());
	applicationDataManager.on('update', () => {
		setData(applicationDataManager.getApplicationData());
	});
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
