import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import { useColorScheme, IconButton } from '@mui/joy';
import React from 'react';
import { SprocketTooltip } from '../SprocketTooltip';

export function ThemeToggleButton() {
	const { mode, setMode } = useColorScheme();
	const [mounted, setMounted] = React.useState(false);
	React.useEffect(() => {
		setMounted(true);
	}, []);
	if (!mounted) {
		return <IconButton size="sm" variant="soft" color="neutral" />;
	}
	return (
		<SprocketTooltip text="Toggle Theme">
			<IconButton
				id="toggle-mode"
				size="sm"
				variant="soft"
				color="neutral"
				onClick={() => {
					if (mode === 'light') {
						setMode('dark');
					} else {
						setMode('light');
					}
				}}
			>
				{mode === 'light' ? <DarkModeRoundedIcon /> : <LightModeRoundedIcon />}
			</IconButton>
		</SprocketTooltip>
	);
}
