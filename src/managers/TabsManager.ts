import { ApplicationData } from '../types/application-data/application-data';
import { TabType } from '../types/state/state';
import { TabsContextType } from './GlobalContextManager';

class TabsManager {
	public static readonly INSTANCE = new TabsManager();

	private constructor() {}

	selectTab(tabContext: TabsContextType, tabId: string, tabType: TabType) {
		const { tabs, setTabs } = tabContext;
		if (tabs.tabs[tabId] != null) {
			setTabs({ tabs: tabs.tabs, selected: tabId });
		} else {
			setTabs({ tabs: { ...tabs.tabs, [tabId]: tabType }, selected: tabId });
		}
	}

	closeTab(tabContext: TabsContextType, tabId: string) {
		const { tabs, setTabs } = tabContext;
		const newTabs = structuredClone(tabs.tabs);
		delete newTabs[tabId];
		const newTabsKeys = Object.keys(newTabs);
		if (tabs.selected === tabId && newTabsKeys.length > 0) {
			tabs.selected = newTabsKeys[0];
		}
		setTabs({ tabs: newTabs, selected: tabs.selected });
	}

	getMapFromTabType(data: ApplicationData, tabType: TabType) {
		let _exaustive: never;
		switch (tabType) {
			case 'endpoint':
				return data.endpoints;
			case 'environment':
				return data.environments;
			case 'request':
				return data.requests;
			case 'service':
				return data.services;
			default:
				_exaustive = tabType;
				return data.endpoints;
		}
	}
}

export const tabsManager = TabsManager.INSTANCE;
