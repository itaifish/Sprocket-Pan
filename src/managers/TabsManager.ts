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
		const { setTabs } = tabContext;
		setTabs((tabs) => {
			const newTabs = structuredClone(tabs.tabs);
			delete newTabs[tabId];
			const newTabsKeys = Object.keys(newTabs);
			let selected = tabs.selected;
			if (tabs.selected === tabId) {
				if (newTabsKeys.length > 0) {
					selected = newTabsKeys[0];
				} else {
					selected = null;
				}
			}
			return { tabs: newTabs, selected };
		});
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
