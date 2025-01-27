import { Box, BoxProps } from '@mui/joy';
import { PropsWithChildren } from 'react';

interface HoverDecoratorProps extends PropsWithChildren, BoxProps {
	endDecorator?: React.ReactNode;
	startDecorator?: React.ReactNode;
}

export function HoverDecorator({ startDecorator, children, endDecorator, sx, ...props }: HoverDecoratorProps) {
	return (
		<Box
			sx={{
				...sx,
				position: 'relative',
				':hover': { '& .on-hover': { opacity: 1 } },
				'& .on-hover': { transition: 'opacity 0.25s' },
			}}
			{...props}
		>
			{startDecorator != null && (
				<Box className="on-hover" sx={{ position: 'absolute', left: '-30px', top: '-5px', opacity: 0 }}>
					{startDecorator}
				</Box>
			)}
			{children}
			{endDecorator != null && (
				<Box className="on-hover" sx={{ position: 'absolute', right: '-30px', top: '-5px', opacity: 0 }}>
					{endDecorator}
				</Box>
			)}
		</Box>
	);
}
