import { FormControl, FormLabel, Switch, SwitchProps } from '@mui/joy';

export interface SprocketSwitchProps extends Omit<SwitchProps, 'onChange' | 'endDecorator'> {
	onChange: (val: boolean) => void;
	label?: string;
	endLabel?: [string, string];
}

export function SprocketSwitch({
	sx,
	checked,
	onChange,
	label,
	endLabel = ['Enabled', 'Disabled'],
	...props
}: SprocketSwitchProps) {
	return (
		<FormControl sx={sx}>
			{label != null && <FormLabel>{label}</FormLabel>}
			<Switch
				sx={{ alignSelf: 'start' }}
				checked={checked}
				onChange={(event) => onChange(event.target.checked)}
				color={checked ? 'success' : 'neutral'}
				variant={checked ? 'solid' : 'outlined'}
				endDecorator={checked ? endLabel[0] : endLabel[1]}
				{...props}
			/>
		</FormControl>
	);
}
