import { Stack, Button, CircularProgress, Divider, Typography, Link } from '@mui/joy';
import { emit } from '@tauri-apps/api/event';
import { useEffect, useState } from 'react';
import HelpIcon from '@mui/icons-material/Help';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import { getVersion } from '@tauri-apps/api/app';
import { SettingsTabProps } from './types';
import { SettingsSelect } from './SettingsFields';
import { SprocketTooltip } from '@/components/shared/SprocketTooltip';
import { Constants } from '@/constants/constants';
import { VARIABLE_NAME_DISPLAY, TIPS_SECTION } from '@/types/data/settings';
import { log } from '@/utils/logging';
import { sleep } from '@/utils/misc';

export function GeneralTab({ overlay, settings, onChange }: SettingsTabProps) {
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
			<SettingsSelect
				value={settings.interface.variableNameDisplay}
				overlay={overlay?.interface?.variableNameDisplay}
				sx={{ width: 240 }}
				label="Display Variable Names"
				tooltip="Controls how {environment_variables} are displayed alongside their computed values."
				onChange={(val) => onChange({ interface: { variableNameDisplay: val } })}
				options={[
					{ value: VARIABLE_NAME_DISPLAY.before, label: 'Key and Value' },
					{ value: VARIABLE_NAME_DISPLAY.none, label: 'Value Only' },
					{ value: VARIABLE_NAME_DISPLAY.hover, label: 'Key on Hover' },
				]}
			/>
			<SettingsSelect
				sx={{ width: 240 }}
				label="Tips Section Messages"
				value={settings.interface.tipsSection}
				overlay={overlay?.interface?.tipsSection}
				onChange={(val) => onChange({ interface: { tipsSection: val } })}
				options={[
					{ value: TIPS_SECTION.tips, label: 'Sprocket Tips Only' },
					{ value: TIPS_SECTION.all, label: 'All Messages' },
					{ value: TIPS_SECTION.dyk, label: 'Did You Know Only' },
					{ value: TIPS_SECTION.hidden, label: 'Hidden' },
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
