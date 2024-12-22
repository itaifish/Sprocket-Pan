import { Button, FormControl, FormLabel, Stack, Typography } from '@mui/joy';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import { appLocalDataDir, appLogDir } from '@tauri-apps/api/path';
import { invoke } from '@tauri-apps/api';
import TimerIcon from '@mui/icons-material/Timer';
import { SettingsTabProps } from './types';
import { SettingsInput, SettingsSwitch } from './SettingsFields';
import { MS_IN_MINUTE } from '@/constants/constants';
import { FileSystemWorker } from '@/managers/file-system/FileSystemWorker';
import { log } from '@/utils/logging';
import { toNumberOrUndefined } from '@/utils/math';
import ManageHistoryIcon from '@mui/icons-material/ManageHistory';
import { History } from '@mui/icons-material';

function toMSMinuteOrUndefined(num: unknown) {
	const ret = toNumberOrUndefined(num);
	return ret == null ? undefined : ret * MS_IN_MINUTE;
}

export function DataTab({ overlay, onChange, settings }: SettingsTabProps) {
	const autosave = settings.data.autosave;
	const oversave = overlay?.data?.autosave;
	const autosaveEnabled = oversave?.enabled ?? autosave.enabled;
	const historyEnabled = overlay?.history?.enabled ?? settings.history.enabled;
	return (
		<>
			<Stack spacing={3}>
				<Typography>Saving</Typography>
				<Stack direction="row" gap={2}>
					<FormControl sx={{ width: 250 }}>
						<FormLabel>Autosave</FormLabel>
						<SettingsSwitch
							checked={autosave.enabled}
							onChange={(enabled) => onChange({ data: { autosave: { enabled } } })}
							endDecorator={autosaveEnabled ? 'Enabled' : 'Disabled'}
							overlay={oversave?.enabled}
						/>
					</FormControl>
					<SettingsInput
						sx={{ width: 250 }}
						inputSx={{ width: 250 }}
						disabled={!autosaveEnabled}
						id="autosave-duration"
						label="Interval"
						value={autosave.intervalMS / MS_IN_MINUTE}
						overlay={oversave?.intervalMS == null ? undefined : oversave.intervalMS / MS_IN_MINUTE}
						onChange={(val) => onChange({ data: { autosave: { intervalMS: toMSMinuteOrUndefined(val) } } })}
						startDecorator={<TimerIcon />}
						endDecorator="Minutes"
					/>
				</Stack>
				<Stack direction="row" gap={2}>
					<FormControl sx={{ width: 250 }}>
						<FormLabel>History Tracking</FormLabel>
						<SettingsSwitch
							checked={settings.history.enabled}
							onChange={(enabled) => onChange({ history: { enabled } })}
							endDecorator={historyEnabled ? 'Enabled' : 'Disabled'}
							overlay={overlay?.history?.enabled}
						/>
					</FormControl>
					<Stack gap={2}>
						<SettingsInput
							type="number"
							disabled={!historyEnabled}
							sx={{ width: 250 }}
							inputSx={{ width: 250 }}
							id="maximum-history-duration"
							label="Maximum Records Per Request"
							value={settings.history.maxLength}
							overlay={overlay?.history?.maxLength}
							onChange={(val) => onChange({ history: { maxLength: toNumberOrUndefined(val) } })}
							startDecorator={<ManageHistoryIcon />}
							endDecorator="Records"
							hint="Set this value to -1 for no maximum."
						/>
						<SettingsInput
							type="number"
							disabled={!historyEnabled}
							sx={{ width: 250 }}
							inputSx={{ width: 250 }}
							id="maximum-history-time"
							label="Automatically Delete Records After"
							value={settings.history.maxDays}
							overlay={overlay?.history?.maxDays}
							onChange={(val) => onChange({ history: { maxDays: toNumberOrUndefined(val) } })}
							startDecorator={<History />}
							endDecorator="Days"
							hint="Set this value to -1 for no maximum."
						/>
					</Stack>
				</Stack>
				<Typography>Data</Typography>
				<Stack direction="row" gap={2}>
					<Button
						sx={{ width: '250px' }}
						startDecorator={<FolderOpenIcon />}
						onClick={async () => {
							const localDir = await appLocalDataDir();
							const data = `${localDir}${FileSystemWorker.DATA_FOLDER_NAME}`;
							invoke('show_in_explorer', { path: data });
						}}
						variant="outlined"
					>
						Open Data Folder
					</Button>
					<Button
						sx={{ width: '250px' }}
						startDecorator={<FolderOpenIcon />}
						onClick={async () => {
							const logDir = await appLogDir();
							const data = `${logDir}${log.LOG_FILE_NAME}`;
							invoke('show_in_explorer', { path: data });
						}}
						variant="outlined"
					>
						Open Logs Folder
					</Button>
				</Stack>
			</Stack>
		</>
	);
}
