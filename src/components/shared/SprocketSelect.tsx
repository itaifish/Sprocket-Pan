import { FormControl, FormLabel, Select, Option, FormHelperText } from '@mui/joy';
import { SxProps } from '@mui/joy/styles/types';
import { SprocketTooltip } from './SprocketTooltip';
import { Info } from '@mui/icons-material';

interface SelectOption<T> {
	value: T;
	label: string;
}

export interface SprocketSelectProps<T> {
	decorator?: React.ReactNode;
	label: string | React.ReactNode;
	value: T;
	options: SelectOption<T>[];
	onChange: (value: T) => void;
	sx?: SxProps;
	hint?: string;
	tooltip?: string;
}

export function SprocketSelect<T>({
	decorator,
	label,
	options,
	onChange,
	sx,
	value,
	hint,
	tooltip,
}: SprocketSelectProps<T>) {
	return (
		<FormControl sx={sx}>
			<FormLabel id={`select-${label}-label`} htmlFor={`select-${label}-button`}>
				{label}
				{tooltip != null && (
					<SprocketTooltip text={tooltip}>
						<Info />
					</SprocketTooltip>
				)}
			</FormLabel>
			<Select
				startDecorator={decorator}
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
			{hint != null && <FormHelperText>{hint}</FormHelperText>}
		</FormControl>
	);
}
