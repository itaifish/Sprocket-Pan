import { Box, Sheet } from '@mui/joy';
import { PropsWithChildren } from 'react';

interface SideDrawerProps extends PropsWithChildren {
	open: boolean;
}

export function SideDrawer({ open, children }: SideDrawerProps) {
	if (!open) {
		return null;
	}
	return (
		<Box>
			<Box
				role="button"
				sx={{
					position: 'absolute',
					inset: 0,
					bgcolor: (theme) => `rgba(${theme.vars.palette.neutral.darkChannel} / 0.8)`,
				}}
			/>
			<Sheet
				sx={{
					minWidth: 350,
					width: 400,
					maxWidth: 700,
					height: '100vh',
					p: 2,
					boxShadow: 'lg',
					overflowY: 'scroll',
					overflowX: 'hidden',
					position: 'relative',
					resize: 'horizontal',
				}}
			>
				{children}
			</Sheet>
		</Box>
	);
}
