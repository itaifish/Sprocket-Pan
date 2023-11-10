import { createContext } from 'react';
import { StateContext, TabType } from '../types/state/state';
import { ApplicationData } from '../types/application-data/application-data';

export const DrawerContext = createContext<StateContext<boolean, 'drawerOpen'>>({
	drawerOpen: true,
	setDrawerOpen: null as unknown as React.Dispatch<React.SetStateAction<boolean>>,
});
export const ApplicationDataContext = createContext<ApplicationData>({
	services: {},
	endpoints: {},
	requests: {},
	environments: {},
	settings: {
		debugLogs: true,
	},
});

export type TabsType = { tabs: Record<string, TabType>; selected: string | null };
export type TabsContextType = StateContext<TabsType, 'tabs'>;
export const TabsContext = createContext<TabsContextType>(null as unknown as TabsContextType);

export type ServicesSearchContextType = StateContext<string, 'searchText'>;
export const ServicesSearchContext = createContext<ServicesSearchContextType>(
	null as unknown as ServicesSearchContextType,
);
