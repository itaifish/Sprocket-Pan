import { Stack, Button, CircularProgress, Divider, Typography, Link } from '@mui/joy';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import { InputSlider } from '../../shared/input/InputSlider';
import { Settings } from '../../../types/settings/settings';
import { emit } from '@tauri-apps/api/event';
import { log } from '../../../utils/logging';
import { useEffect, useState } from 'react';
import { sleep } from '../../../utils/misc';
import { Constants } from '../../../utils/constants';
import HelpIcon from '@mui/icons-material/Help';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import { SprocketTooltip } from '../../shared/SprocketTooltip';
import { getVersion } from '@tauri-apps/api/app';
import { SprocketSelect } from '../../shared/SprocketSelect';

export interface SettingsTabProps {
	settings: Settings;
	setSettings: (settings: Partial<Settings>) => void;
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
			<InputSlider
				value={settings.zoomLevel}
				label="Zoom"
				setValue={(val) => setSettings({ zoomLevel: val })}
				endDecorator="%"
				icon={<ZoomInIcon />}
				range={{ min: 20, max: 300 }}
			/>
			<SprocketSelect
				sx={{ width: 240 }}
				label="Theme"
				value={settings.defaultTheme}
				onChange={(value) => {
					setSettings({ defaultTheme: value as Settings['defaultTheme'] });
				}}
				options={[
					{ value: 'light', label: 'Light Mode' },
					{ value: 'dark', label: 'Dark Mode' },
					{ value: 'system-default', label: 'System Default' },
				]}
			/>
			<SprocketSelect
				sx={{ width: 240 }}
				label="Display Variable Names"
				value={settings.displayVariableNames}
				onChange={(value) => {
					setSettings({ displayVariableNames: value });
				}}
				options={[
					{ value: true, label: 'Key and Value' },
					{ value: false, label: 'Value Only' },
				]}
			/>
			<SprocketSelect
				sx={{ width: 240 }}
				label="List Style"
				value={settings.listStyle}
				onChange={(value) => {
					setSettings({ listStyle: value as Settings['listStyle'] });
				}}
				options={[
					{ value: 'compact', label: 'Compact' },
					{ value: 'default', label: 'Default' },
					{ value: 'cozy', label: 'Cozy' },
				]}
			/>
			<Divider />
			<Typography level="body-md">
				Version {version} -{' '}
				<Link href="https://sprocketpan.com" target="_blank">
					View the docs
				</Link>
			</Typography>
			<Stack direction="row" spacing={2} alignItems={'center'}>
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
