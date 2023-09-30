import { createContext, useState } from 'react';
import { ThemeToggleButton } from './components/atoms/theme-toggle/ThemeToggleButton';
import { SideDrawer } from './components/molecules/SideDrawer';

export const DrawerContext = createContext({ drawerOpen: true, setDrawerOpen: (_: boolean) => undefined as void });

function App() {
	const [drawerOpen, setDrawerOpen] = useState(true);
	return (
		<div className="container">
			<DrawerContext.Provider value={{ drawerOpen, setDrawerOpen }}>
				{drawerOpen && (
					<SideDrawer>
						<ThemeToggleButton />
					</SideDrawer>
				)}
			</DrawerContext.Provider>
		</div>
	);
}

export default App;
