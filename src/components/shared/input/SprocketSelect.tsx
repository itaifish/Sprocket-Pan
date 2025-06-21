import { FormControl, FormLabel, Select, Option, FormHelperText, SelectProps } from '@mui/joy';
import { SxProps } from '@mui/joy/styles/types';
import { Info } from '@mui/icons-material';
import { SprocketTooltip } from '../SprocketTooltip';
import { useComponentIdentifier } from '@/hooks/useComponentIdentifier';

export type SelectOption<T> = {
	value: T;
	group?: string;
} & ({ label: string } | { label: React.ReactNode; key: string | number });

type SelectPropsSubset = Omit<SelectProps<any, any>, 'onChange' | 'value' | 'slotProps'>;

export interface SprocketSelectProps<T> extends SelectPropsSubset {
	value: T;
	options: SelectOption<T>[];
	onChange: (value: T) => void;
	label?: string;
	controlSx?: SxProps;
	hint?: string;
	tooltip?: string;
}

export function SprocketSelect<T>({
	label,
	options,
	onChange,
	controlSx,
	value,
	hint,
	tooltip,
	placeholder,
	...overrides
}: SprocketSelectProps<T>) {
	const aria = useComponentIdentifier();
	return (
		<FormControl sx={controlSx}>
			{label != null && (
				<FormLabel id={`select-${aria}-label`} htmlFor={`select-${aria}-button`}>
					{label}
					{tooltip != null && (
						<SprocketTooltip text={tooltip}>
							<Info />
						</SprocketTooltip>
					)}
				</FormLabel>
			)}
			<Select
				slotProps={{
					button: {
						id: `select-${aria}-button`,
						// TODO: Material UI set aria-labelledby correctly & automatically
						// but Base UI and Joy UI don't yet.
						'aria-labelledby': label == null ? undefined : `select-${aria}-label select-${aria}-button`,
					},
				}}
				placeholder={placeholder}
				value={value}
				onChange={(_, value) => {
					if (value != null) {
						onChange(value as T);
					}
				}}
				{...overrides}
			>
				{options.map((option) => (
					<Option key={'key' in option ? option.key : option.label} value={option.value}>
						{option.label}
					</Option>
				))}
			</Select>
			{hint != null && <FormHelperText>{hint}</FormHelperText>}
		</FormControl>
	);
}
