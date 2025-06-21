import { Settings } from '@/types/data/settings';
import { WorkspaceSettings } from '@/types/data/workspace';

export interface SettingsTabProps {
	overlay?: WorkspaceSettings;
	settings: Settings;
	searchText?: string;
	onChange: (settings: WorkspaceSettings) => void;
	onUpdateGlobal: (settings: WorkspaceSettings) => void;
}
