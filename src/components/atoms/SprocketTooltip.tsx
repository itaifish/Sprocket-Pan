import { Tooltip, TooltipProps } from '@mui/joy';

interface SprocketTooltipProps extends Partial<TooltipProps> {
	children: JSX.Element;
	text: string;
	disabled?: boolean;
}

export function SprocketTooltip({ children, text, disabled, ...props }: SprocketTooltipProps) {
	return disabled ? (
		<>{children}</>
	) : (
		<Tooltip variant={'outlined'} arrow {...props} title={text}>
			{children}
		</Tooltip>
	);
}
