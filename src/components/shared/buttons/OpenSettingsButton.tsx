import { Box, IconButton } from '@mui/joy';
import { useState } from 'react';
import SettingsIcon from '@mui/icons-material/Settings';
import { SprocketTooltip } from '../SprocketTooltip';
import { SprocketModal } from '../modals/SprocketModal';

export interface OpenSettingsButtonProps {
	Content: (props: { onClose: () => void }) => JSX.Element;
}

export function OpenSettingsButton({ Content }: OpenSettingsButtonProps) {
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
					if (reason !== 'backdropClick') {
						setIsOpen(false);
					}
				}}
				aria-labelledby="Settings"
				aria-describedby="Setting popout panel"
			>
				<Box>
					<Content onClose={() => setIsOpen(false)} />
				</Box>
			</SprocketModal>
		</>
	);
}
