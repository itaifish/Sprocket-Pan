import { Stack, Typography, useTheme } from '@mui/joy';
import { PropsWithChildren } from 'react';

interface SettingsGroupProps extends PropsWithChildren {
	title: string;
}

export function SettingsGroup({ title, children }: SettingsGroupProps) {
	const theme = useTheme();
	return (
		<Stack gap={1} sx={{ borderLeft: '1px solid ' + theme.palette.primary.solidBg, pl: 2, mt: 1 }}>
			<Typography>{title}</Typography>
			{children}
		</Stack>
	);
}
