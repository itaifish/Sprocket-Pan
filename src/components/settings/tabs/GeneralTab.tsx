import { Select, Stack, Option, FormControl, FormLabel, Button, CircularProgress, Box } from '@mui/joy';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import { InputSlider } from '../../shared/input/InputSlider';
import { Settings } from '../../../types/settings/settings';
import { emit } from '@tauri-apps/api/event';
import { log } from '../../../utils/logging';
import { useState } from 'react';
import { sleep } from '../../../utils/misc';
import { Constants } from '../../../utils/constants';
import HelpIcon from '@mui/icons-material/Help';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import { SprocketTooltip } from '../../shared/SprocketTooltip';

export interface SettingsTabProps {
	settings: Settings;
	setSettings: (settings: Partial<Settings>) => void;
}

export function GeneralTab({ settings, setSettings }: SettingsTabProps) {
	const [checkingForUpdate, setCheckingForUpdate] = useState(false);
	const [hasCheckedForUpdate, setHasCheckedForUpdate] = useState(false);
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
			<FormControl sx={{ width: 240 }}>
				<FormLabel id="select-default-theme-label" htmlFor="select-default-theme-button">
					Theme
				</FormLabel>
				<Select
					value={settings.defaultTheme}
					placeholder="Theme"
					onChange={(_e, value) => {
						if (value != null) {
							setSettings({ defaultTheme: value });
						}
					}}
					slotProps={{
						button: {
							id: 'select-default-theme-button',
							// TODO: Material UI set aria-labelledby correctly & automatically
							// but Base UI and Joy UI don't yet.
							'aria-labelledby': 'select-default-theme-label select-default-theme-button',
						},
					}}
				>
					<Option value="light">Light Mode</Option>
					<Option value="dark">Dark Mode</Option>
					<Option value="system-default">System Default</Option>
				</Select>
			</FormControl>
			<FormControl sx={{ width: 240 }}>
				<FormLabel id="select-default-theme-label" htmlFor="select-default-theme-button">
					Display Variable Names
				</FormLabel>
				<Select
					value={settings.displayVariableNames}
					onChange={(_e, value) => {
						if (value != null) {
							setSettings({ displayVariableNames: value });
						}
					}}
					slotProps={{
						button: {
							id: 'select-display-names-button',
							// TODO: Material UI set aria-labelledby correctly & automatically
							// but Base UI and Joy UI don't yet.
							'aria-labelledby': 'select-display-names-label select-display-names-button',
						},
					}}
				>
					<Option value={true}>Key and Value</Option>
					<Option value={false}>Value Only</Option>
				</Select>
			</FormControl>
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
				</Button>{' '}
				<Box sx={{ transform: 'scale(1.5)' }}>
					{hasCheckedForUpdate ? (
						<SprocketTooltip text="You have already checked for updates">
							<CloudDoneIcon color="success" />
						</SprocketTooltip>
					) : (
						<SprocketTooltip text="You have not yet checked for updates">
							<HelpIcon color="primary" />
						</SprocketTooltip>
					)}
				</Box>
			</Stack>
		</Stack>
	);
}
