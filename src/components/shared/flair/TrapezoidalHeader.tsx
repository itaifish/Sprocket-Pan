import { TrapezoidalSheet } from './TrapezoidalSheet';
import { SheetProps, Stack, Typography } from '@mui/joy';

interface TrapezoidalHeaderProps extends SheetProps {
	reverse?: boolean;
}

export function TrapezoidalHeader({ children, sx, reverse, ...props }: TrapezoidalHeaderProps) {
	return (
		<Stack width="100%" alignItems={reverse ? 'end' : 'start'}>
			<TrapezoidalSheet
				reverse={reverse}
				variant="soft"
				color="primary"
				sx={{ width: '100%', maxWidth: '225px', ...sx }}
				{...props}
			>
				<Stack height="100%" justifyContent="center" alignItems={reverse ? 'end' : 'start'}>
					<Typography component="div" mx={3}>
						{children}
					</Typography>
				</Stack>
			</TrapezoidalSheet>
		</Stack>
	);
}
