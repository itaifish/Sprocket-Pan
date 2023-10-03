import { TabsContextType } from '../App';
import { ApplicationData } from '../types/application-data/application-data';
import { TabType } from '../types/state/state';

class TabsManager {
	public static readonly INSTANCE = new TabsManager();

	private constructor() {}

	selectTab(tabContext: TabsContextType, tabId: string, tabType: TabType) {
		const { tabs, setTabs } = tabContext;
		if (tabs.tabs[tabId] != null) {
			setTabs({ tabs: tabs.tabs, selected: tabId });
			return;
		}
		setTabs({ tabs: { ...tabs.tabs, [tabId]: tabType }, selected: tabId });
	}

	private getMapFromTabType(data: ApplicationData, tabType: TabType) {
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
				break;
		}
	}
}

export const tabsManager = TabsManager.INSTANCE;
