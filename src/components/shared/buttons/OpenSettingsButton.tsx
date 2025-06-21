import { IconButton } from '@mui/joy';
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
			<SprocketTooltip text="Settings" placement="right">
				<IconButton onClick={() => setIsOpen(true)} variant="plain" color="neutral">
					<SettingsIcon />
				</IconButton>
			</SprocketTooltip>
			<SprocketModal size="lg" open={isOpen} onClose={() => setIsOpen(false)} closeOn={[]}>
				<Content onClose={() => setIsOpen(false)} />
			</SprocketModal>
		</>
	);
}
