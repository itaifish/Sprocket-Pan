import { FormControl, FormLabel, Select, Option, FormHelperText } from '@mui/joy';
import { SxProps } from '@mui/joy/styles/types';
import { Info } from '@mui/icons-material';
import { GroupedOptions, SelectOption } from './GroupedOptions';
import { SprocketTooltip } from '../SprocketTooltip';
import { useComponentIdentifier } from '@/hooks/useComponentIdentifier';

export interface SprocketSelectProps<T> {
	decorator?: React.ReactNode;
	label?: string;
	value: T;
	options: SelectOption<T>[];
	onChange: (value: T) => void;
	sx?: SxProps;
	hint?: string;
	tooltip?: string;
	grouped?: boolean;
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
	grouped = false,
}: SprocketSelectProps<T>) {
	const aria = useComponentIdentifier();
	return (
		<FormControl sx={sx}>
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
				startDecorator={decorator}
				slotProps={{
					button: {
						id: `select-${aria}-button`,
						// TODO: Material UI set aria-labelledby correctly & automatically
						// but Base UI and Joy UI don't yet.
						'aria-labelledby': label == null ? undefined : `select-${aria}-label select-${aria}-button`,
					},
				}}
				value={value}
				onChange={(_, value) => {
					if (value != null) {
						onChange(value as T);
					}
				}}
			>
				{grouped ? (
					<GroupedOptions options={options} aria={aria} />
				) : (
					options.map((option) => (
						<Option key={option.label} value={option.value}>
							{option.label}
						</Option>
					))
				)}
			</Select>
			{hint != null && <FormHelperText>{hint}</FormHelperText>}
		</FormControl>
	);
}
