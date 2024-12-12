import { Settings } from '../../../types/settings/settings';
import { RecursivePartial } from '../../../types/utils/utils';

export interface SettingsTabProps {
	overlay?: RecursivePartial<Settings>;
	settings: Settings;
	onChange: (settings: RecursivePartial<Settings>) => void;
}
