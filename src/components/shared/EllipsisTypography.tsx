import { Box, Typography, TypographyProps } from '@mui/joy';
import { PropsWithChildren } from 'react';

export function EllipsisSpan({ children }: PropsWithChildren) {
	return (
		<Box
			component="span"
			sx={{
				maxWidth: '100%',
				width: '100%',
				textOverflow: 'ellipsis',
				textWrap: 'nowrap',
				whiteSpace: 'nowrap',
				overflow: 'hidden',
			}}
		>
			{children}
		</Box>
	);
}

export function EllipsisTypography({ sx, children, ...props }: TypographyProps) {
	return (
		<Typography
			{...props}
			sx={{
				flex: 1,
				maxWidth: '100%',
				width: '100%',
				textOverflow: 'ellipsis',
				textWrap: 'nowrap',
				whiteSpace: 'nowrap',
				overflow: 'hidden',
				...sx,
			}}
			fontSize="sm"
		>
			{children}
		</Typography>
	);
}
