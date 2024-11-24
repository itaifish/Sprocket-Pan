import { FormControl, FormLabel, Select, Option } from '@mui/joy';
import { SxProps } from '@mui/joy/styles/types';

interface SelectOption<T> {
	value: T;
	label: string;
}

interface SprocketSelectProps<T> {
	label: string;
	value: T;
	options: SelectOption<T>[];
	onChange: (value: T) => void;
	sx?: SxProps;
}

export function SprocketSelect<T>({ label, options, onChange, sx, value }: SprocketSelectProps<T>) {
	return (
		<FormControl sx={sx}>
			<FormLabel id={`select-${label}-label`} htmlFor={`select-${label}-button`}>
				{label}
			</FormLabel>
			<Select
				slotProps={{
					button: {
						id: `select-${label}-button`,
						// TODO: Material UI set aria-labelledby correctly & automatically
						// but Base UI and Joy UI don't yet.
						'aria-labelledby': `select-${label}-label select-${label}-button`,
					},
				}}
				value={value}
				onChange={(_e, value) => {
					if (value != null) {
						onChange(value as T);
					}
				}}
			>
				{options.map((option) => (
					<Option key={option.label} value={option.value}>
						{option.label}
					</Option>
				))}
			</Select>
		</FormControl>
	);
}
