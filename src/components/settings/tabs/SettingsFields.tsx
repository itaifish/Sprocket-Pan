import { FormControl, FormLabel, IconButton, Stack } from '@mui/joy';
import { StrategyInput, StrategyInputProps } from './StrategyInput';
import { InputSliderProps, InputSlider } from '@/components/shared/input/InputSlider';
import { SprocketInputProps, SprocketInput } from '@/components/shared/input/SprocketInput';
import { SprocketSwitchProps, SprocketSwitch } from '@/components/shared/input/SprocketSwitch';
import { SprocketSelectProps, SprocketSelect } from '@/components/shared/input/SprocketSelect';
import { SprocketTooltip } from '@/components/shared/SprocketTooltip';
import { PaletteSelect, PaletteSelectProps } from '@/components/shared/input/PaletteSelect';
import { SxProps } from '@mui/joy/styles/types';
import { useShouldDisplayFromSearch } from './hooks';
import { FluentGlobeArrowUp } from '@/assets/icons/fluent/FluentGlobeArrowUp';
import { FluentGlobeReset } from '@/assets/icons/fluent/FluentGlobeReset';

interface ResetButtonProps {
	override: boolean;
	onReset: () => void;
	onUpdateGlobal?: () => void;
	sx?: SxProps;
}

export function ResetButton({ override, onReset, onUpdateGlobal, sx }: ResetButtonProps) {
	console.log({ onUpdateGlobal });
	return (
		<Stack
			direction="row"
			justifyContent="center"
			justifyItems="end"
			sx={{ maxHeight: '30px', width: '72px', overflow: 'visible' }}
		>
			{override && (
				<>
					<SprocketTooltip text="Reset to Global Setting" sx={sx}>
						<IconButton onClick={onReset}>
							<FluentGlobeReset />
						</IconButton>
					</SprocketTooltip>
					{onUpdateGlobal && (
						<SprocketTooltip text="Update Global Setting to Selected Value" sx={sx}>
							<IconButton onClick={onUpdateGlobal}>
								<FluentGlobeArrowUp />
							</IconButton>
						</SprocketTooltip>
					)}
				</>
			)}
		</Stack>
	);
}

// there has to be some way to wrap these in a HOC.

interface SettingsFieldProps<T> {
	overlay: T | undefined;
	searchText?: string;
	onChange: (arg: T | undefined) => void;
	onUpdateGlobal: (arg: T) => void;
}

export function SettingsSelect<T>({
	value,
	overlay,
	onChange,
	onUpdateGlobal,
	searchText,
	...props
}: SprocketSelectProps<T> & SettingsFieldProps<T>) {
	const shouldDisplay = useShouldDisplayFromSearch(props.label, searchText);
	if (!shouldDisplay) {
		return <></>;
	}
	const override = overlay !== undefined;
	return (
		<Stack direction="row" gap={1} alignItems="start">
			<SprocketSelect onChange={onChange} value={override ? overlay : value} {...props} />
			<ResetButton
				onReset={() => onChange(undefined)}
				onUpdateGlobal={value !== overlay ? () => onUpdateGlobal(overlay ?? value) : undefined}
				override={override}
				sx={{ mt: '1.6em' }}
			/>
		</Stack>
	);
}

export function SettingsInput({
	value,
	overlay,
	onChange,
	onUpdateGlobal,
	searchText,
	...props
}: SprocketInputProps & SettingsFieldProps<SprocketInputProps['value']>) {
	const override = overlay !== undefined;
	const shouldDisplay = useShouldDisplayFromSearch(props.label, searchText);
	if (!shouldDisplay) {
		return <></>;
	}
	return (
		<Stack direction="row" gap={1} alignItems="start">
			<SprocketInput onChange={onChange} value={override ? overlay : value} {...props} />
			<ResetButton
				onReset={() => onChange(undefined)}
				onUpdateGlobal={value !== overlay ? () => onUpdateGlobal(overlay ?? value) : undefined}
				override={override}
				sx={{ mt: '1.6em' }}
			/>
		</Stack>
	);
}

export function SettingsPaletteSelect({
	value,
	overlay,
	onChange,
	onUpdateGlobal,
	...props
}: PaletteSelectProps & SettingsFieldProps<string>) {
	const override = overlay !== undefined;
	return (
		<Stack direction="row" gap={1} alignItems="start">
			<PaletteSelect value={override ? overlay : value} onChange={onChange} {...props} />
			<ResetButton
				onReset={() => onChange(undefined)}
				onUpdateGlobal={value !== overlay ? () => onUpdateGlobal(overlay ?? value) : undefined}
				override={override}
				sx={{ mt: '1.65em' }}
			/>
		</Stack>
	);
}

export function SettingsStrategyInput({
	value,
	overlay,
	searchText,
	onChange,
	onUpdateGlobal,
}: StrategyInputProps & SettingsFieldProps<StrategyInputProps['value']>) {
	const override = overlay !== undefined;
	const label = 'Script Execution Order';
	const shouldDisplay = useShouldDisplayFromSearch(label, searchText);
	if (!shouldDisplay) {
		return <></>;
	}
	return (
		<FormControl sx={{ width: 'fit-content' }}>
			<FormLabel>{label}</FormLabel>
			<Stack direction="row" gap={1} alignItems="start">
				<StrategyInput value={override ? overlay : value} onChange={onChange} />
				<ResetButton
					onReset={() => onChange(undefined)}
					onUpdateGlobal={value !== overlay ? () => onUpdateGlobal(overlay ?? value) : undefined}
					override={override}
				/>
			</Stack>
		</FormControl>
	);
}

export function SettingsSlider({
	value,
	overlay,
	onChange,
	onUpdateGlobal,
	searchText,
	...props
}: InputSliderProps & SettingsFieldProps<number>) {
	const override = overlay !== undefined;
	const shouldDisplay = useShouldDisplayFromSearch(props.label, searchText);
	if (!shouldDisplay) {
		return <></>;
	}
	return (
		<Stack direction="row" alignItems="start" gap={1}>
			<InputSlider value={override ? overlay : value} onChange={onChange} {...props} />
			<ResetButton
				onReset={() => onChange(undefined)}
				onUpdateGlobal={value !== overlay ? () => onUpdateGlobal(overlay ?? value) : undefined}
				override={override}
				sx={{ mt: '1.6em' }}
			/>
		</Stack>
	);
}

export function SettingsSwitch({
	checked,
	overlay,
	onChange,
	onUpdateGlobal,
	searchText,
	...props
}: SprocketSwitchProps & SettingsFieldProps<boolean>) {
	const override = overlay !== undefined;
	const shouldDisplay = useShouldDisplayFromSearch(props.label, searchText);
	if (!shouldDisplay) {
		return <></>;
	}
	return (
		<Stack direction="row" alignItems="start" gap={1} minHeight="3em">
			<SprocketSwitch checked={override ? overlay : checked} onChange={onChange} {...props} />
			<ResetButton
				onReset={() => onChange(undefined)}
				onUpdateGlobal={checked === overlay ? undefined : () => onUpdateGlobal(overlay ?? checked!)}
				override={override}
				sx={{ mt: '1em' }}
			/>
		</Stack>
	);
}
