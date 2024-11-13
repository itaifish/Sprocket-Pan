import { IconButton } from '@mui/joy';
import { useState } from 'react';
import SettingsIcon from '@mui/icons-material/Settings';
import { SprocketTooltip } from '../shared/SprocketTooltip';
import { SettingsPanel } from './SettingsPanel';
import { SprocketModal } from '../shared/modals/SprocketModal';

export function OpenSettingsButton() {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<>
			<SprocketTooltip text="Settings">
				<IconButton onClick={() => setIsOpen(true)} size="sm" variant="soft" color="neutral">
					<SettingsIcon />
				</IconButton>
			</SprocketTooltip>
			<SprocketModal
				open={isOpen}
				onClose={(_event, reason) => {
					if (reason != 'backdropClick') {
						setIsOpen(false);
					}
				}}
				aria-labelledby="Settings"
				aria-describedby="Setting popout panel"
			>
				<SettingsPanel closePanel={() => setIsOpen(false)} />
			</SprocketModal>
		</>
	);
}
