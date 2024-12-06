import { Box } from '@mui/joy';
import { PropsWithChildren } from 'react';

interface GradientBorderBoundingBoxProps extends PropsWithChildren {
	gradient?: string;
}

const DEFAULT_GRADIENT = 'linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)';

export function GradientBorderBoundingBox({ gradient = DEFAULT_GRADIENT, children }: GradientBorderBoundingBoxProps) {
	return (
		<Box
			sx={{
				position: 'relative',
				'&::before': {
					content: '""',
					position: 'absolute',
					top: 0,
					left: 0,
					bottom: 0,
					right: 0,
					m: '-2px',
					borderRadius: '50%',
					background: gradient,
				},
			}}
		>
			{children}
		</Box>
	);
}
