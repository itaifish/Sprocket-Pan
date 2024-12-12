import { Switch, SwitchProps } from '@mui/joy';

export interface SprocketSwitchProps extends Omit<SwitchProps, 'onChange'> {
	onChange: (val: boolean) => void;
}

export function SprocketSwitch({ checked, onChange, ...props }: SprocketSwitchProps) {
	return (
		<Switch
			checked={checked}
			onChange={(event) => onChange(event.target.checked)}
			color={checked ? 'success' : 'neutral'}
			variant={checked ? 'solid' : 'outlined'}
			{...props}
		/>
	);
}
