import { Stack, Button, CircularProgress, Divider, Typography, Link } from '@mui/joy';
import { Settings, VARIABLE_NAME_DISPLAY } from '../../../types/settings/settings';
import { emit } from '@tauri-apps/api/event';
import { log } from '../../../utils/logging';
import { useEffect, useState } from 'react';
import { sleep } from '../../../utils/misc';
import HelpIcon from '@mui/icons-material/Help';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import { SprocketTooltip } from '../../shared/SprocketTooltip';
import { getVersion } from '@tauri-apps/api/app';
import { SprocketSelect } from '../../shared/SprocketSelect';
import { Constants } from '../../../constants/constants';
import { RecursivePartial } from '../../../types/utils/utils';

export interface SettingsTabProps {
	settings: Settings;
	setSettings: (settings: RecursivePartial<Settings>) => void;
}

export function GeneralTab({ settings, setSettings }: SettingsTabProps) {
	const [checkingForUpdate, setCheckingForUpdate] = useState(false);
	const [hasCheckedForUpdate, setHasCheckedForUpdate] = useState(false);
	const [version, setVersion] = useState('Loading Version...');
	const updateVersion = async () => {
		const newVersion = await getVersion();
		setVersion(newVersion);
	};
	useEffect(() => {
		updateVersion();
	}, []);
	return (
		<Stack spacing={3}>
			<SprocketSelect
				sx={{ width: 240 }}
				label="Display Variable Names"
				tooltip="Controls how {environment_variables} are displayed alongside their computed values."
				value={settings.interface.variableNameDisplay}
				onChange={(val) => setSettings({ interface: { variableNameDisplay: val } })}
				options={[
					{ value: VARIABLE_NAME_DISPLAY.before, label: 'Key and Value' },
					{ value: VARIABLE_NAME_DISPLAY.none, label: 'Value Only' },
				]}
			/>
			<Divider />
			<Typography level="body-md">
				Version {version} -{' '}
				<Link href="https://sprocketpan.com" target="_blank">
					View the docs
				</Link>
			</Typography>
			<Stack direction="row" spacing={2} alignItems="center">
				<Button
					startDecorator={checkingForUpdate ? <CircularProgress /> : <></>}
					onClick={async () => {
						if (!checkingForUpdate) {
							setCheckingForUpdate(true);
							await Promise.all([
								sleep(Constants.minimumScriptRunTimeMS),
								emit('tauri://update').catch((e) => log.error(e)),
							]);
							setCheckingForUpdate(false);
							setHasCheckedForUpdate(true);
						}
					}}
					disabled={checkingForUpdate}
					sx={{ maxWidth: '300px' }}
				>
					Check for update
				</Button>
				{hasCheckedForUpdate ? (
					<SprocketTooltip text="You have already checked for updates">
						<CloudDoneIcon sx={{ transform: 'scale(1.4)' }} color="success" />
					</SprocketTooltip>
				) : (
					<SprocketTooltip text="You have not yet checked for updates">
						<HelpIcon sx={{ transform: 'scale(1.4)' }} color="primary" />
					</SprocketTooltip>
				)}
			</Stack>
		</Stack>
	);
}
