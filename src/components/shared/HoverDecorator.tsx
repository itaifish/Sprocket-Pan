import { Box, Stack, StackProps } from '@mui/joy';
import { PropsWithChildren } from 'react';

interface HoverDecoratorProps extends PropsWithChildren, StackProps {
	endDecorator?: React.ReactNode;
	startDecorator?: React.ReactNode;
}

export function HoverDecorator({ startDecorator, children, endDecorator, sx, ...props }: HoverDecoratorProps) {
	return (
		<Stack direction="row" sx={{ ...sx, ':hover': { '& .on-hover': { display: 'block' } } }} {...props}>
			{startDecorator != null && (
				<Box className="on-hover" sx={{ opacity: 0 }}>
					{startDecorator}
				</Box>
			)}
			{children}
			{endDecorator != null && (
				<Box className="on-hover" sx={{ display: 'none' }}>
					{endDecorator}
				</Box>
			)}
		</Stack>
	);
}
