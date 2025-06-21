import { Settings } from './settings';
import { UiMetadata } from './shared';

export type GlobalData = {
	uiMetadata: UiMetadata;
	settings: Settings;
	lastSaved: number;
};
