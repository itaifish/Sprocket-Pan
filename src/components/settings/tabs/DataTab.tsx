import { Button, Stack, Typography } from '@mui/joy';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import { appLogDir } from '@tauri-apps/api/path';
import TimerIcon from '@mui/icons-material/Timer';
import { SettingsTabProps } from './types';
import { SettingsInput, SettingsSwitch } from './SettingsFields';
import { MS_IN_MINUTE } from '@/constants/constants';
import { FileSystemWorker } from '@/managers/file-system/FileSystemWorker';
import { log } from '@/utils/logging';
import { toNumberOrUndefined } from '@/utils/math';
import ManageHistoryIcon from '@mui/icons-material/ManageHistory';
import { History } from '@mui/icons-material';
import { RustInvoker } from '@/managers/RustInvoker';

function toMSMinuteOrUndefined(num: unknown) {
	const ret = toNumberOrUndefined(num);
	return ret == null ? undefined : ret * MS_IN_MINUTE;
}

export function DataTab({ overlay, onChange, onUpdateGlobal, searchText, settings }: SettingsTabProps) {
	const autosave = settings.data.autosave;
	const oversave = overlay?.data?.autosave;
	const autosaveEnabled = oversave?.enabled ?? autosave.enabled;
	const historyEnabled = overlay?.history?.enabled ?? settings.history.enabled;
	return (
		<>
			<Stack spacing={3}>
				<Typography>Saving</Typography>
				<Stack direction="row" gap={2}>
					<SettingsSwitch
						searchText={searchText}
						sx={{ width: 240 }}
						label="Autosave"
						checked={autosave.enabled}
						onChange={(enabled) => onChange({ data: { autosave: { enabled } } })}
						onUpdateGlobal={(enabled) => onUpdateGlobal({ data: { autosave: { enabled } } })}
						overlay={oversave?.enabled}
					/>
					<SettingsInput
						sx={{ width: 240 }}
						searchText={searchText}
						inputSx={{ width: 240 }}
						disabled={!autosaveEnabled}
						id="autosave-duration"
						label="Autosave Interval"
						value={autosave.intervalMS / MS_IN_MINUTE}
						overlay={oversave?.intervalMS == null ? undefined : oversave.intervalMS / MS_IN_MINUTE}
						onChange={(val) => onChange({ data: { autosave: { intervalMS: toMSMinuteOrUndefined(val) } } })}
						onUpdateGlobal={(val) => onUpdateGlobal({ data: { autosave: { intervalMS: toMSMinuteOrUndefined(val) } } })}
						startDecorator={<TimerIcon />}
						endDecorator="Minutes"
					/>
				</Stack>
				<Stack direction="row" gap={2}>
					<SettingsSwitch
						sx={{ width: 240 }}
						searchText={searchText}
						label="History Tracking"
						checked={settings.history.enabled}
						onChange={(enabled) => onChange({ history: { enabled } })}
						onUpdateGlobal={(enabled) => onUpdateGlobal({ history: { enabled } })}
						overlay={overlay?.history?.enabled}
					/>
					<Stack gap={2}>
						<SettingsInput
							type="number"
							searchText={searchText}
							disabled={!historyEnabled}
							sx={{ width: 240 }}
							inputSx={{ width: 240 }}
							id="maximum-history-duration"
							label="Maximum Records Per Request"
							value={settings.history.maxLength}
							overlay={overlay?.history?.maxLength}
							onChange={(val) => onChange({ history: { maxLength: toNumberOrUndefined(val) } })}
							onUpdateGlobal={(val) => onUpdateGlobal({ history: { maxLength: toNumberOrUndefined(val) } })}
							startDecorator={<ManageHistoryIcon />}
							endDecorator="Records"
							hint="Set this value to -1 for no maximum."
						/>
						<SettingsInput
							type="number"
							searchText={searchText}
							disabled={!historyEnabled}
							sx={{ width: 240 }}
							inputSx={{ width: 240 }}
							id="maximum-history-time"
							label="Automatically Delete Records After"
							value={settings.history.maxDays}
							overlay={overlay?.history?.maxDays}
							onChange={(val) => onChange({ history: { maxDays: toNumberOrUndefined(val) } })}
							onUpdateGlobal={(val) => onUpdateGlobal({ history: { maxDays: toNumberOrUndefined(val) } })}
							startDecorator={<History />}
							endDecorator="Days"
							hint="Set this value to -1 for no maximum."
						/>
					</Stack>
				</Stack>
				<Typography>Data</Typography>
				<SettingsSwitch
					searchText={searchText}
					sx={{ width: 240 }}
					label="Workspace Data Validation"
					checked={settings.data.validation.enabled}
					onChange={(enabled) => onChange({ data: { validation: { enabled } } })}
					onUpdateGlobal={(enabled) => onUpdateGlobal({ data: { validation: { enabled } } })}
					overlay={overlay?.data?.validation?.enabled}
				/>
				<Stack direction="row" gap={2}>
					<Button
						sx={{ width: '240px' }}
						startDecorator={<FolderOpenIcon />}
						onClick={() => RustInvoker.showInExplorer({ path: FileSystemWorker.DATA_FOLDER_NAME })}
						variant="outlined"
					>
						Open Data Folder
					</Button>
					<Button
						sx={{ width: '240px' }}
						startDecorator={<FolderOpenIcon />}
						onClick={async () => {
							const logDir = await appLogDir();
							RustInvoker.showInExplorer({ path: `${logDir}${log.LOG_FILE_NAME}`, absolute: true });
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
