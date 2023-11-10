import { createContext, useEffect, useState } from 'react';
import { SideDrawer } from './components/molecules/file-system/SideDrawer';
import { applicationDataManager } from './managers/ApplicationDataManager';
import { StateContext, TabType } from './types/state/state';
import { log } from './utils/logging';
import { TabHeader } from './components/molecules/tabs/TabHeader';
import { Box, Grid } from '@mui/joy';
import { SideDrawerActionButtons } from './components/molecules/file-system/SideDrawerActionButtons';
import { NavigableServicesFileSystem } from './components/molecules/file-system/NavigableServicesFileSystem';
import { useMonaco } from '@monaco-editor/react';
import { initMonaco } from './managers/MonacoInitManager';
import {
	ApplicationDataContext,
	DrawerContext,
	ServicesSearchContext,
	TabsContext,
	TabsType,
} from './managers/GlobalContextManager';

function App() {
	const [drawerOpen, setDrawerOpen] = useState(true);
	const [data, setData] = useState(applicationDataManager.getApplicationData());
	const monaco = useMonaco();

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

	useEffect(() => {
		if (monaco) {
			initMonaco(monaco);
		}
	}, [monaco]);

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
