import { Stack, Typography, Divider } from '@mui/joy';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';

import { SettingsTabProps } from './types';
import { SettingsInput, SettingsStrategyInput } from './SettingsFields';
import { toNumberOrUndefined } from '@/utils/math';

function toMSOrUndefined(num: unknown) {
	const ret = toNumberOrUndefined(num);
	return ret == null ? undefined : ret * 1000;
}

export function ActionsTab({ overlay, settings, searchText, onChange, onUpdateGlobal }: SettingsTabProps) {
	return (
		<Stack spacing={3}>
			<Typography level="title-md">Requests</Typography>
			<SettingsInput
				searchText={searchText}
				sx={{ width: 250 }}
				inputSx={{ width: 250 }}
				id="network-timeout"
				label="Network Call Timeout"
				value={settings.request.timeoutMS / 1000}
				overlay={overlay?.request?.timeoutMS == null ? undefined : overlay.request.timeoutMS / 1000}
				onChange={(val) => onChange({ request: { timeoutMS: toMSOrUndefined(val) } })}
				onUpdateGlobal={(val) => onUpdateGlobal({ request: { timeoutMS: toMSOrUndefined(val) } })}
				startDecorator={<HourglassBottomIcon />}
				endDecorator="Seconds"
			/>
			<Divider></Divider>
			<Typography level="title-md">Scripts</Typography>
			<SettingsInput
				searchText={searchText}
				type="number"
				sx={{ width: 250 }}
				inputSx={{ width: 250 }}
				id="script-timeout"
				label="Script Timeout"
				value={settings.script.timeoutMS / 1000}
				overlay={overlay?.script?.timeoutMS == null ? undefined : overlay.script.timeoutMS / 1000}
				onChange={(val) => onChange({ script: { timeoutMS: toMSOrUndefined(val) } })}
				onUpdateGlobal={(val) => onUpdateGlobal({ script: { timeoutMS: toMSOrUndefined(val) } })}
				startDecorator={<HourglassBottomIcon />}
				endDecorator="Seconds"
			/>
			<SettingsStrategyInput
				searchText={searchText}
				value={settings.script.strategy}
				overlay={overlay?.script?.strategy as any}
				onChange={(strategy) => onChange({ script: { strategy } })}
				onUpdateGlobal={(strategy) => onUpdateGlobal({ script: { strategy } })}
			/>
		</Stack>
	);
}
