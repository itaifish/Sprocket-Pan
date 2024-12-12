import { Stack } from '@mui/joy';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import { BASE_THEME, LIST_STYLING, SCROLLBAR_VISIBILITY } from '../../../types/settings/settings';
import { SettingsTabProps } from './types';
import { SettingsSelect, SettingsSlider } from './SettingsFields';

export function ThemeTab({ overlay, settings, onChange }: SettingsTabProps) {
	return (
		<Stack spacing={3}>
			<SettingsSlider
				value={settings.theme.zoom}
				overlay={overlay?.theme?.zoom}
				label="Zoom"
				onChange={(val) => onChange({ theme: { zoom: val } })}
				endDecorator="%"
				icon={<ZoomInIcon />}
				range={{ min: 25, max: 175 }}
			/>
			<SettingsSelect
				sx={{ width: 240 }}
				label="Base Theme"
				value={settings.theme.base}
				overlay={overlay?.theme?.base}
				onChange={(val) => onChange({ theme: { base: val } })}
				options={[
					{ value: BASE_THEME.light, label: 'Light Mode' },
					{ value: BASE_THEME.dark, label: 'Dark Mode' },
					{ value: BASE_THEME.default, label: 'System Default' },
				]}
			/>
			<SettingsSelect
				sx={{ width: 240 }}
				label="List Style"
				value={settings.theme.list}
				overlay={overlay?.theme?.list}
				onChange={(val) => onChange({ theme: { list: val } })}
				options={[
					{ value: LIST_STYLING.compact, label: 'Compact' },
					{ value: LIST_STYLING.default, label: 'Default' },
					{ value: LIST_STYLING.cozy, label: 'Cozy' },
				]}
			/>
			<SettingsSelect
				sx={{ width: 240 }}
				label="Scrollbar Visibility"
				value={settings.theme.scrollbarVisibility}
				overlay={overlay?.theme?.scrollbarVisibility}
				onChange={(val) => onChange({ theme: { scrollbarVisibility: val } })}
				options={[
					{ value: SCROLLBAR_VISIBILITY.compact, label: 'Compact' },
					{ value: SCROLLBAR_VISIBILITY.hidden, label: 'Invisible' },
					{ value: SCROLLBAR_VISIBILITY.visible, label: 'Visible' },
				]}
			/>
		</Stack>
	);
}
