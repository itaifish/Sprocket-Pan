import { Settings } from './settings';
import { UiMetadata } from './shared';
import { SprocketTheme } from './sprocketTheme';

export type GlobalData = {
	uiMetadata: UiMetadata;
	settings: Settings;
	lastSaved: number;
	themes: Record<string, SprocketTheme>;
};
