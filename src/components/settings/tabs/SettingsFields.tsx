import { FormControl, FormLabel, IconButton, Stack } from '@mui/joy';
import { SprocketSelect, SprocketSelectProps } from '../../shared/SprocketSelect';
import { Public } from '@mui/icons-material';
import { SprocketTooltip } from '../../shared/SprocketTooltip';
import { SprocketInput, SprocketInputProps } from '../../shared/input/SprocketInput';
import { StrategyInput, StrategyInputProps } from './StrategyInput';
import { InputSlider, InputSliderProps } from '../../shared/input/InputSlider';
import { SprocketSwitch, SprocketSwitchProps } from '../../shared/input/SprocketSwitch';

interface SettingsFieldProps<T> {
	overlay: T | undefined;
	onChange: (arg: T | undefined) => void;
}

export function SettingsSelect<T>({
	value,
	overlay,
	onChange,
	...props
}: SprocketSelectProps<T> & SettingsFieldProps<T>) {
	const override = overlay !== undefined;
	return (
		<Stack direction="row" gap={1} alignItems="start">
			<SprocketSelect onChange={onChange} value={override ? overlay : value} {...props} />
			{override && (
				<SprocketTooltip text="Reset to Global Setting" sx={{ mt: '2em' }}>
					<IconButton size="sm" onClick={() => onChange(undefined)}>
						<Public />
					</IconButton>
				</SprocketTooltip>
			)}
		</Stack>
	);
}

export function SettingsInput({
	value,
	overlay,
	onChange,
	...props
}: SprocketInputProps & SettingsFieldProps<SprocketInputProps['value']>) {
	const override = overlay !== undefined;
	return (
		<Stack direction="row" gap={1} alignItems="start">
			<SprocketInput onChange={onChange} value={override ? overlay : value} {...props} />
			{override && (
				<SprocketTooltip text="Reset to Global Setting" sx={{ mt: '2em' }}>
					<IconButton size="sm" onClick={() => onChange(undefined)}>
						<Public />
					</IconButton>
				</SprocketTooltip>
			)}
		</Stack>
	);
}

export function SettingsStrategyInput({
	value,
	overlay,
	onChange,
}: StrategyInputProps & SettingsFieldProps<StrategyInputProps['value']>) {
	const override = overlay !== undefined;
	return (
		<FormControl sx={{ width: 'fit-content' }}>
			<FormLabel>Script Execution Order</FormLabel>
			<Stack direction="row" gap={1} alignItems="start">
				<StrategyInput value={override ? overlay : value} onChange={onChange} />
				{override && (
					<SprocketTooltip text="Reset to Global Setting">
						<IconButton size="sm" onClick={() => onChange(undefined)}>
							<Public />
						</IconButton>
					</SprocketTooltip>
				)}
			</Stack>
		</FormControl>
	);
}

export function SettingsSlider({ value, overlay, onChange, ...props }: InputSliderProps & SettingsFieldProps<number>) {
	const override = overlay !== undefined;
	return (
		<Stack direction="row" alignItems="start" gap={1}>
			<InputSlider value={override ? overlay : value} onChange={onChange} {...props} />
			{override && (
				<SprocketTooltip text="Reset to Global Setting" sx={{ mt: '2em' }}>
					<IconButton size="sm" onClick={() => onChange(undefined)}>
						<Public />
					</IconButton>
				</SprocketTooltip>
			)}
		</Stack>
	);
}

export function SettingsSwitch({
	checked,
	overlay,
	onChange,
	...props
}: SprocketSwitchProps & SettingsFieldProps<boolean>) {
	const override = overlay !== undefined;
	return (
		<Stack direction="row" alignItems="start" gap={1} minHeight="2em">
			<SprocketSwitch checked={override ? overlay : checked} onChange={onChange} {...props} />
			{override && (
				<SprocketTooltip text="Reset to Global Setting">
					<IconButton size="sm" onClick={() => onChange(undefined)}>
						<Public />
					</IconButton>
				</SprocketTooltip>
			)}
		</Stack>
	);
}
