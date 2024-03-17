import { Select, Stack, Option, FormControl, FormLabel } from '@mui/joy';
import { InputSlider } from '../atoms/input/InputSlider';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import { Settings } from '../../types/settings/settings';

export interface SettingsTabProps {
	settings: Settings;
	setSettings: (settings: Partial<Settings>) => void;
}

export function GeneralTab({ settings, setSettings }: SettingsTabProps) {
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
		</Stack>
	);
}
