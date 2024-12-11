import { Box, Button, FormControl, FormLabel, Input, Stack, Switch, Typography } from '@mui/joy';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import { appLocalDataDir, appLogDir } from '@tauri-apps/api/path';
import { invoke } from '@tauri-apps/api';
import { log } from '../../../utils/logging';
import TimerIcon from '@mui/icons-material/Timer';
import { FileSystemWorker } from '../../../managers/file-system/FileSystemWorker';
import { MS_IN_MINUTE } from '../../../constants/constants';
import { SettingsTabProps } from './types';
import { WorkspaceDataSection, WorkspaceDataSectionProps } from './WorkspaceDataSection';

export type DataTabProps = SettingsTabProps & Partial<WorkspaceDataSectionProps>;

export function DataTab({ goToWorkspaceSelection, onChange, settings }: DataTabProps) {
	const autosave = settings.data.autosave;

	return (
		<>
			<Stack spacing={2}>
				<Typography>Saving</Typography>
				<Stack direction="row" gap={2}>
					<FormControl sx={{ width: 250 }}>
						<FormLabel>Autosave</FormLabel>
						<Box>
							<Switch
								checked={autosave.enabled}
								onChange={(event) => onChange({ data: { autosave: { enabled: event.target.checked } } })}
								color={autosave.enabled ? 'success' : 'neutral'}
								variant={autosave.enabled ? 'solid' : 'outlined'}
								endDecorator={autosave.enabled ? 'Enabled' : 'Disabled'}
							/>
						</Box>
					</FormControl>
					<FormControl sx={{ width: 250 }}>
						<FormLabel id="autosave-duration-label" htmlFor="autosave-duration-input">
							Interval
						</FormLabel>
						<Input
							disabled={!autosave.enabled}
							sx={{ width: 250 }}
							value={autosave.intervalMS / MS_IN_MINUTE}
							onChange={(e) => {
								const value = +e.target.value;
								if (!isNaN(value) && value > 0) {
									onChange({ data: { autosave: { intervalMS: value * MS_IN_MINUTE } } });
								}
							}}
							slotProps={{
								input: {
									id: 'autosave-duration-input',
									// TODO: Material UI set aria-labelledby correctly & automatically
									// but Base UI and Joy UI don't yet.
									'aria-labelledby': 'autosave-duration-label autosave-duration-input',
								},
							}}
							startDecorator={<TimerIcon />}
							endDecorator={'Minutes'}
						/>
					</FormControl>
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
