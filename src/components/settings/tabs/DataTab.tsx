import { Button, FormControl, FormLabel, Stack, Typography } from '@mui/joy';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import { appLocalDataDir, appLogDir } from '@tauri-apps/api/path';
import { invoke } from '@tauri-apps/api';
import { log } from '../../../utils/logging';
import TimerIcon from '@mui/icons-material/Timer';
import { FileSystemWorker } from '../../../managers/file-system/FileSystemWorker';
import { MS_IN_MINUTE } from '../../../constants/constants';
import { SettingsTabProps } from './types';
import { WorkspaceDataSection, WorkspaceDataSectionProps } from './WorkspaceDataSection';
import { SettingsInput, SettingsSwitch } from './SettingsFields';
import { toNumberOrUndefined } from '../../../utils/math';

export type DataTabProps = SettingsTabProps & Partial<WorkspaceDataSectionProps>;

function toMSMinuteOrUndefined(num: unknown) {
	const ret = toNumberOrUndefined(num);
	return ret == null ? undefined : ret * MS_IN_MINUTE;
}

export function DataTab({ overlay, goToWorkspaceSelection, onChange, settings }: DataTabProps) {
	const autosave = settings.data.autosave;
	const oversave = overlay?.data?.autosave;
	const autosaveEnabled = oversave?.enabled ?? autosave.enabled;
	return (
		<>
			<Stack spacing={2}>
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
						endDecorator={'Minutes'}
					/>
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
				{goToWorkspaceSelection && <WorkspaceDataSection goToWorkspaceSelection={goToWorkspaceSelection} />}
			</Stack>
		</>
	);
}
