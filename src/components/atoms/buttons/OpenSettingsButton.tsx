import { IconButton, Modal } from '@mui/joy';
import { useState } from 'react';
import SettingsIcon from '@mui/icons-material/Settings';
import { SprocketTooltip } from '../SprocketTooltip';
import { SettingsPanel } from '../../organisms/SettingsPanel';

export function OpenSettingsButton() {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<>
			<SprocketTooltip text="Settings">
				<IconButton onClick={() => setIsOpen(true)}>
					<SettingsIcon />
				</IconButton>
			</SprocketTooltip>
			<Modal
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
			</Modal>
		</>
	);
}
