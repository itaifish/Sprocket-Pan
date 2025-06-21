import { Stack, Button, CircularProgress, Divider, Typography, Link } from '@mui/joy';
import { emit } from '@tauri-apps/api/event';
import { useEffect, useState } from 'react';
import HelpIcon from '@mui/icons-material/Help';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import { getVersion } from '@tauri-apps/api/app';
import { SettingsTabProps } from './types';
import { SettingsSelect, SettingsSwitch } from './SettingsFields';
import { SprocketTooltip } from '@/components/shared/SprocketTooltip';
import { Constants } from '@/constants/constants';
import { VariableNameDisplay, TipsSection } from '@/types/data/settings';
import { log } from '@/utils/logging';
import { sleep } from '@/utils/misc';

export function GeneralTab({ overlay, settings, onChange, onUpdateGlobal, searchText }: SettingsTabProps) {
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
				searchText={searchText}
				value={settings.interface.variableNameDisplay}
				overlay={overlay?.interface?.variableNameDisplay}
				sx={{ width: 250 }}
				label="Display Variable Names"
				tooltip="Controls how {environment_variables} are displayed alongside their computed values."
				onChange={(val) => onChange({ interface: { variableNameDisplay: val } })}
				onUpdateGlobal={(val) => onUpdateGlobal({ interface: { variableNameDisplay: val } })}
				options={[
					{ value: VariableNameDisplay.before, label: 'Key and Value' },
					{ value: VariableNameDisplay.none, label: 'Value Only' },
					{ value: VariableNameDisplay.hover, label: 'Key on Hover' },
				]}
			/>
			<SettingsSelect
				sx={{ width: 250 }}
				label="Tips Section Messages"
				searchText={searchText}
				value={settings.interface.tipsSection}
				overlay={overlay?.interface?.tipsSection}
				onChange={(val) => onChange({ interface: { tipsSection: val } })}
				onUpdateGlobal={(val) => onUpdateGlobal({ interface: { tipsSection: val } })}
				options={[
					{ value: TipsSection.tips, label: 'Sprocket Tips Only' },
					{ value: TipsSection.all, label: 'All Messages' },
					{ value: TipsSection.dyk, label: 'Did You Know Only' },
					{ value: TipsSection.hidden, label: 'Hidden' },
				]}
			/>
			<SettingsSwitch
				sx={{ width: 250 }}
				searchText={searchText}
				label="List Virtualization"
				checked={settings.virtualization.enabled}
				onChange={(enabled) => onChange({ virtualization: { enabled } })}
				onUpdateGlobal={(enabled) => onUpdateGlobal({ virtualization: { enabled } })}
				overlay={overlay?.virtualization?.enabled}
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
