import { FormControl, FormHelperText, FormLabel, Input, InputProps } from '@mui/joy';
import { SxProps } from '@mui/joy/styles/types';

export interface SprocketInputProps extends Omit<InputProps, 'onChange'> {
	id: string;
	inputSx?: SxProps;
	label?: React.ReactNode;
	hint?: React.ReactNode;
	onChange?: (val: string) => void;
}

export function SprocketInput({ id, sx, label, hint, inputSx, onChange, ...inputProps }: SprocketInputProps) {
	return (
		<FormControl sx={sx}>
			<FormLabel id={`${id}-label`} htmlFor={`${id}-input`}>
				{label}
			</FormLabel>
			<Input
				onChange={(e) => onChange?.(e.target.value)}
				{...inputProps}
				sx={inputSx}
				slotProps={{
					input: {
						id: `${id}-input`,
						// TODO: Material UI set aria-labelledby correctly & automatically
						// but Base UI and Joy UI don't yet.
						'aria-labelledby': `${id}-label ${id}-input`,
					},
				}}
			/>
			{hint != null && <FormHelperText>{hint}</FormHelperText>}
		</FormControl>
	);
}
