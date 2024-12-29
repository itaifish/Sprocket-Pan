import { Tooltip, TooltipProps } from '@mui/joy';

interface SprocketTooltipProps extends Partial<TooltipProps> {
	children: JSX.Element;
	text: string;
	disabled?: boolean;
}

export function SprocketTooltip({ children, text, disabled, sx, ...props }: SprocketTooltipProps) {
	return disabled ? (
		<>{children}</>
	) : (
		<Tooltip
			enterDelay={750}
			enterNextDelay={100}
			variant="outlined"
			arrow
			sx={{ maxWidth: '333px', textAlign: 'center', ...sx }}
			{...props}
			title={text}
		>
			{children}
		</Tooltip>
	);
}
