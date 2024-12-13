import { Button, Stack } from '@mui/joy';
import NotInterestedIcon from '@mui/icons-material/NotInterested';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import { TipsSection } from './TipsSection';
import { Settings } from '@/types/data/settings';
import { RecursivePartial } from '@/types/utils/utils';

interface SettingsBarProps {
	onClose: () => void;
	onSave: () => void;
	lastSaved: number;
	hasChanged: boolean;
	settings: Settings;
	overlay?: RecursivePartial<Settings>;
}

export function SettingsBar({ onClose, onSave, lastSaved, hasChanged, settings }: SettingsBarProps) {
	return (
		<Stack gap={3} direction="row" justifyContent="space-between" alignItems="center" mt={1}>
			<TipsSection variant={settings.interface.tipsSection} timestamp={lastSaved} />
			<Stack gap={1} direction="row">
				<Button
					color={hasChanged ? 'danger' : 'warning'}
					startDecorator={hasChanged ? <NotInterestedIcon /> : <ExitToAppIcon />}
					onClick={onClose}
				>
					{hasChanged ? 'Cancel' : 'Close'}
				</Button>
				<Button startDecorator={<ThumbUpAltIcon />} disabled={!hasChanged} onClick={onSave}>
					Apply
				</Button>
			</Stack>
		</Stack>
	);
}
