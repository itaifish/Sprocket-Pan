import { Box, BoxProps, Sheet } from '@mui/joy';

export function SideDrawer(props: BoxProps) {
	return (
		<Box
			{...props}
			sx={[
				{ position: 'fixed', zIndex: 1200, width: '100%', height: '100%' },
				...(Array.isArray(props.sx) ? props.sx : [props.sx]),
			]}
		>
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
					minWidth: 256,
					width: 'max-content',
					height: '100%',
					p: 2,
					boxShadow: 'lg',
					bgcolor: 'background.surface',
					overflow: 'scroll',
				}}
			>
				{props.children}
			</Sheet>
		</Box>
	);
}
