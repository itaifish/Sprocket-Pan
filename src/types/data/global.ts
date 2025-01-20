import { Settings } from './settings';
import { UiMetadata } from './shared';
import { CustomizableSprocketTheme } from './sprocketTheme';

export type GlobalData = {
	uiMetadata: UiMetadata;
	settings: Settings;
	lastSaved: number;
	themes: Record<string, CustomizableSprocketTheme>;
};
