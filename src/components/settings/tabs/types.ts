import { Settings } from '@/types/data/settings';
import { WorkspaceSettings } from '@/types/data/workspace';

export interface SettingsTabProps {
	overlay?: WorkspaceSettings;
	settings: Settings;
	onChange: (settings: WorkspaceSettings) => void;
}
