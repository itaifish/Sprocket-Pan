import { Tooltip, TooltipProps } from '@mui/joy';

export function SprocketTooltip({
	children,
	text,
	...props
}: { children: JSX.Element; text: string } & Partial<TooltipProps>) {
	return (
		<Tooltip variant={'outlined'} arrow {...props} title={text}>
			{children}
		</Tooltip>
	);
}
