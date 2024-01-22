import { Tooltip, TooltipProps } from '@mui/joy';

export function SprocketTooltip({
	children,
	text,
	disabled,
	...props
}: { children: JSX.Element; text: string; disabled?: boolean } & Partial<TooltipProps>) {
	return disabled ? (
		<>{children}</>
	) : (
		<Tooltip variant={'outlined'} arrow {...props} title={text}>
			{children}
		</Tooltip>
	);
}
