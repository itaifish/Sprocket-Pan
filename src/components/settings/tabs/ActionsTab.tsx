import { Stack, Typography, Divider } from '@mui/joy';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import ManageHistoryIcon from '@mui/icons-material/ManageHistory';
import { SettingsTabProps } from './types';
import { SettingsInput, SettingsStrategyInput } from './SettingsFields';
import { toNumberOrUndefined } from '../../../utils/math';

function toMSOrUndefined(num: unknown) {
	const ret = toNumberOrUndefined(num);
	return ret == null ? undefined : ret * 1000;
}

export function ActionsTab({ overlay, settings, onChange }: SettingsTabProps) {
	return (
		<Stack spacing={3}>
			<Typography level="title-md">Requests</Typography>
			<SettingsInput
				sx={{ width: 250 }}
				inputSx={{ width: 250 }}
				id="network-timeout"
				label="Network Call Timeout"
				value={settings.request.timeoutMS / 1000}
				overlay={overlay?.request?.timeoutMS == null ? undefined : overlay.request.timeoutMS / 1000}
				onChange={(val) => onChange({ request: { timeoutMS: toMSOrUndefined(val) } })}
				startDecorator={<HourglassBottomIcon />}
				endDecorator={'Seconds'}
			/>
			<SettingsInput
				type="number"
				sx={{ width: 250 }}
				inputSx={{ width: 250 }}
				id="maximum-history"
				label="Maximum Saved History Records"
				value={settings.history.maxLength}
				overlay={overlay?.history?.maxLength}
				onChange={(val) => onChange({ history: { maxLength: toNumberOrUndefined(val) } })}
				startDecorator={<ManageHistoryIcon />}
				endDecorator={'Records'}
				hint="Set this value as -1 for no maximum."
			/>
			<Divider></Divider>
			<Typography level="title-md">Scripts</Typography>
			<SettingsInput
				type="number"
				sx={{ width: 250 }}
				inputSx={{ width: 250 }}
				id="script-timeout"
				label="Script Timeout"
				value={settings.script.timeoutMS / 1000}
				overlay={overlay?.script?.timeoutMS == null ? undefined : overlay.script.timeoutMS / 1000}
				onChange={(val) => onChange({ script: { timeoutMS: toMSOrUndefined(val) } })}
				startDecorator={<HourglassBottomIcon />}
				endDecorator={'Seconds'}
			/>
			<SettingsStrategyInput
				value={settings.script.strategy}
				overlay={overlay?.script?.strategy as any}
				onChange={(strategy) => onChange({ script: { strategy } })}
			/>
		</Stack>
	);
}
