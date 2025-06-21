import { FormControl, FormHelperText, FormLabel, Input, InputProps, Stack } from '@mui/joy';
import { SxProps } from '@mui/joy/styles/types';

export interface SprocketInputProps extends Omit<InputProps, 'onChange'> {
	id: string;
	inputSx?: SxProps;
	label?: React.ReactNode;
	hint?: React.ReactNode;
	rightContent?: React.ReactNode;
	leftContent?: React.ReactNode;
	onChange?: (val: string) => void;
}

export function SprocketInput({
	id,
	sx,
	label,
	hint,
	inputSx,
	onChange,
	rightContent,
	leftContent,
	...inputProps
}: SprocketInputProps) {
	return (
		<FormControl sx={sx}>
			<FormLabel id={`${id}-label`} htmlFor={`${id}-input`}>
				{label}
			</FormLabel>
			<Stack direction="row" gap={1} alignItems="center">
				{leftContent}
				<Input
					onChange={(e) => onChange?.(e.target.value)}
					{...inputProps}
					sx={{ flex: 1, ...inputSx }}
					slotProps={{
						input: {
							id: `${id}-input`,
							// TODO: Material UI set aria-labelledby correctly & automatically
							// but Base UI and Joy UI don't yet.
							'aria-labelledby': `${id}-label ${id}-input`,
						},
					}}
				/>
				{rightContent}
			</Stack>
			{hint != null && <FormHelperText>{hint}</FormHelperText>}
		</FormControl>
	);
}
