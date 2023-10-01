import { createContext, useState } from 'react';
import { ThemeToggleButton } from './components/atoms/theme-toggle/ThemeToggleButton';
import { SideDrawer } from './components/molecules/SideDrawer';
import { applicationDataManager } from './managers/ApplicationDataManager';
import { NewServiceButton } from './components/atoms/new-service/NewServiceButton';

export const DrawerContext = createContext({ drawerOpen: true, setDrawerOpen: (_: boolean) => undefined as void });
export const ApplicationDataContext = createContext(applicationDataManager.getApplicationData());

function App() {
	const [drawerOpen, setDrawerOpen] = useState(true);
	const [data, setData] = useState(applicationDataManager.getApplicationData());
	applicationDataManager.on('update', () => {
		setData(applicationDataManager.getApplicationData());
	});
	return (
		<div className="container">
			<DrawerContext.Provider value={{ drawerOpen, setDrawerOpen }}>
				<ApplicationDataContext.Provider value={data}>
					{drawerOpen && (
						<SideDrawer>
							<ThemeToggleButton />
							<NewServiceButton />
						</SideDrawer>
					)}
				</ApplicationDataContext.Provider>
			</DrawerContext.Provider>
		</div>
	);
}

export default App;
