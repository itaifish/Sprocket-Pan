import { Stack, FormControl, FormLabel, IconButton, Alert } from '@mui/joy';
import { SettingsTabProps } from './types';
import { open } from '@tauri-apps/api/dialog';
import { SprocketSwitch } from '@/components/shared/input/SprocketSwitch';
import { SprocketInput } from '@/components/shared/input/SprocketInput';
import { Folder, Warning } from '@mui/icons-material';
import { SprocketTooltip } from '@/components/shared/SprocketTooltip';

async function selectFolder(): Promise<string | null> {
	const selectedPath = await open({
		multiple: false,
		directory: true,
	});
	return Array.isArray(selectedPath) ? selectedPath[0] : selectedPath;
}

export function WorkspaceTab({ overlay, onChange }: SettingsTabProps) {
	const sync = overlay?.data?.sync;
	const updateSync = (value: typeof sync) => onChange({ data: { sync: value } });
	return (
		<Stack spacing={3}>
			<FormControl sx={{ width: '250px' }}>
				<FormLabel>Workspace Synchronization</FormLabel>
				<SprocketSwitch
					sx={{ alignSelf: 'start' }}
					checked={sync?.enabled ?? false}
					onChange={(enabled) => onChange({ data: { sync: { enabled } } })}
					endDecorator={sync?.enabled ? 'Enabled' : 'Disabled'}
				/>
			</FormControl>
			<SprocketInput
				sx={{ maxWidth: '600px' }}
				value={sync?.location ?? ''}
				onChange={(location) => updateSync({ location })}
				id="sync-file-path"
				label="Sync Path"
				hint="The path your synchronized files for this workspace are saved to and loaded from."
				rightContent={
					<SprocketTooltip text="Select Folder">
						<IconButton onClick={async () => updateSync({ location: await selectFolder() })}>
							<Folder />
						</IconButton>
					</SprocketTooltip>
				}
			/>
			{sync?.location == null && sync?.enabled && (
				<Alert startDecorator={<Warning />} sx={{ width: 'fit-content' }} color="warning">
					Workspace Synchronization will remain inactive if the sync location is empty.
				</Alert>
			)}
		</Stack>
	);
}
