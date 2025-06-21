import { Button, Stack } from '@mui/joy';
import NotInterestedIcon from '@mui/icons-material/NotInterested';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import { TipsSectionComponent } from './TipsSection';
import { Settings } from '@/types/data/settings';
import { WorkspaceSettings } from '@/types/data/workspace';

interface SettingsBarProps {
	onClose: () => void;
	onSave: () => void;
	lastSaved: number;
	hasChanged: boolean;
	settings: Settings;
	overlay?: WorkspaceSettings;
}

export function SettingsBar({ onClose, onSave, lastSaved, hasChanged, settings, overlay }: SettingsBarProps) {
	// height 0px is to get around some weird mat-dialog spacing and make the bottom more compact
	return (
		<Stack gap={3} direction="row" justifyContent="space-between" alignItems="center" height="0px">
			<TipsSectionComponent
				variant={overlay?.interface?.tipsSection ?? settings.interface.tipsSection}
				timestamp={lastSaved}
			/>
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
