import { Stack } from '@mui/joy';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import { InputSlider } from '../../shared/input/InputSlider';
import { BASE_THEME, LIST_STYLING, SCROLLBAR_VISIBILITY, Settings } from '../../../types/settings/settings';
import { SprocketSelect } from '../../shared/SprocketSelect';
import { RecursivePartial } from '../../../types/utils/utils';

export interface SettingsTabProps {
	settings: Settings;
	setSettings: (settings: RecursivePartial<Settings>) => void;
}

export function ThemeTab({ settings, setSettings }: SettingsTabProps) {
	return (
		<Stack spacing={3}>
			<InputSlider
				value={settings.theme.zoom}
				label="Zoom"
				setValue={(val) => setSettings({ theme: { zoom: val } })}
				endDecorator="%"
				icon={<ZoomInIcon />}
				range={{ min: 25, max: 175 }}
			/>
			<SprocketSelect
				sx={{ width: 240 }}
				label="Base Theme"
				value={settings.theme.base}
				onChange={(val) => setSettings({ theme: { base: val } })}
				options={[
					{ value: BASE_THEME.light, label: 'Light Mode' },
					{ value: BASE_THEME.dark, label: 'Dark Mode' },
					{ value: BASE_THEME.default, label: 'System Default' },
				]}
			/>
			<SprocketSelect
				sx={{ width: 240 }}
				label="List Style"
				value={settings.theme.list}
				onChange={(val) => setSettings({ theme: { list: val } })}
				options={[
					{ value: LIST_STYLING.compact, label: 'Compact' },
					{ value: LIST_STYLING.default, label: 'Default' },
					{ value: LIST_STYLING.cozy, label: 'Cozy' },
				]}
			/>
			<SprocketSelect
				sx={{ width: 240 }}
				label="Scrollbar Visibility"
				value={settings.theme.scrollbarVisibility}
				onChange={(val) => setSettings({ theme: { scrollbarVisibility: val } })}
				options={[
					{ value: SCROLLBAR_VISIBILITY.compact, label: 'Compact' },
					{ value: SCROLLBAR_VISIBILITY.hidden, label: 'Invisible' },
					{ value: SCROLLBAR_VISIBILITY.visible, label: 'Visible' },
				]}
			/>
		</Stack>
	);
}
