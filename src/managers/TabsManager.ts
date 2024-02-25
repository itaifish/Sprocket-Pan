import { EventEmitter } from '@tauri-apps/api/shell';
import { ApplicationData } from '../types/application-data/application-data';
import { TabType } from '../types/state/state';
import { TabsContextType } from './GlobalContextManager';

type TabHistoryElement = {
	type: TabType;
	id: string;
};

type TabEvent = 'TabSelected';
class TabsManager extends EventEmitter<TabEvent> {
	public static readonly INSTANCE = new TabsManager();

	private history: TabHistoryElement[] = [];
	private historyLocation: number = 0;

	private constructor() {
		super();
	}

	/**
	 * This function returns in the index of the next item in the history, if it exists, null otherwise
	 * @returns int representing the index of the next location, if it exists
	 */
	peekHistoryNext() {
		if (this.historyLocation == this.history.length - 1) {
			return null;
		}
		return this.historyLocation + 1;
	}

	/**
	 * This function returns in the index of the previous item in the history, if it exists, null otherwise
	 * @returns int representing the index of the previous location, if it exists
	 */
	peekHistoryPrevious() {
		if (this.historyLocation == 0) {
			return null;
		}
		return this.historyLocation - 1;
	}

	selectTabFromHistory(tabContext: TabsContextType, reselectIndex: number) {
		const tabData = this.history[reselectIndex];
		if (tabData != undefined) {
			this.selectTab(tabContext, tabData.id, tabData.type, reselectIndex);
		}
	}

	selectTab(tabContext: TabsContextType, tabId: string, tabType: TabType, reselectIndex?: number) {
		const { tabs, setTabs } = tabContext;
		if (tabs.tabs[tabId] != null) {
			setTabs({ tabs: tabs.tabs, selected: tabId });
		} else {
			setTabs({ tabs: { ...tabs.tabs, [tabId]: tabType }, selected: tabId });
		}
		if (reselectIndex == undefined) {
			if (tabId != this.history[this.historyLocation]?.id) {
				this.history.splice(this.historyLocation + 1, Infinity, {
					type: tabType,
					id: tabId,
				});
				this.historyLocation = this.history.length - 1;
			}
		} else {
			this.historyLocation = reselectIndex;
		}
		this.emit('TabSelected');
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
