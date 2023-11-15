import { IconButton, Modal } from '@mui/joy';
import { useState } from 'react';
import { SettingsPanel } from '../../organisms/SettingsPanel';
import SettingsIcon from '@mui/icons-material/Settings';

export function OpenSettingsButton() {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<>
			<IconButton onClick={() => setIsOpen(true)}>
				<SettingsIcon />
			</IconButton>
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
