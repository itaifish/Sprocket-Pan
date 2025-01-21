import { Opacity } from '@mui/icons-material';
import { SettingsGroup } from '../SettingsGroup';
import { SettingsSelect, SettingsSlider } from './SettingsFields';
import { SettingsTabProps } from './types';
import { BASE_THEME } from '@/types/data/sprocketTheme';
import { useSelector } from 'react-redux';
import { selectGlobalThemes } from '@/state/global/selectors';

export function ThemeSelection({ overlay, settings, onChange }: SettingsTabProps) {
	const globalThemes = useSelector(selectGlobalThemes);
	return (
		<SettingsGroup title="Theme">
			<SettingsSelect
				sx={{ width: 400 }}
				label="Theme"
				overlay={overlay?.theme?.selected}
				value={settings.theme.selected}
				onChange={(themeName) => themeName && onChange({ theme: { selected: themeName } })}
				options={Object.keys(globalThemes).map((themeName) => ({
					value: themeName,
					label: themeName,
				}))}
			/>
			<SettingsSelect
				sx={{ width: 240 }}
				label="Base Theme"
				value={settings.theme.base}
				overlay={overlay?.theme?.base}
				onChange={(base) => onChange({ theme: { base } })}
				options={[
					{ value: BASE_THEME.light, label: 'Light Mode' },
					{ value: BASE_THEME.dark, label: 'Dark Mode' },
					{ value: BASE_THEME.default, label: 'System Default' },
				]}
			/>
			<SettingsSlider
				value={settings.theme.decoration.opacity}
				overlay={overlay?.theme?.decoration?.opacity}
				label="Decoration Opacity"
				onChange={(opacity) => onChange({ theme: { decoration: { opacity } } })}
				icon={<Opacity />}
				range={{ min: 0, max: 1, step: 0.05 }}
			/>
			{/* <SettingsGroup title="Palettes">
				<SettingsPaletteSelect
					label="Primary"
					value={settings.theme.colors.primary}
					overlay={overlay?.theme?.colors?.primary}
					onChange={(primary) => onChange({ theme: { colors: { primary } } })}
				/>
				<SettingsPaletteSelect
					label="Neutral"
					value={settings.theme.colors.neutral}
					overlay={overlay?.theme?.colors?.neutral}
					onChange={(neutral) => onChange({ theme: { colors: { neutral } } })}
				/>
				<SettingsPaletteSelect
					label="Danger"
					value={settings.theme.colors.danger}
					overlay={overlay?.theme?.colors?.danger}
					onChange={(danger) => onChange({ theme: { colors: { danger } } })}
				/>
				<SettingsPaletteSelect
					label="Success"
					value={settings.theme.colors.success}
					overlay={overlay?.theme?.colors?.success}
					onChange={(success) => onChange({ theme: { colors: { success } } })}
				/>
				<SettingsPaletteSelect
					label="Warning"
					value={settings.theme.colors.warning}
					overlay={overlay?.theme?.colors?.warning}
					onChange={(warning) => onChange({ theme: { colors: { warning } } })}
				/>
			</SettingsGroup>
			<SettingsGroup title="Color Adjustment">
				<SettingsSwitch
					sx={{ width: 240 }}
					label="Filters"
					checked={settings.theme.filters.enabled}
					onChange={(enabled) => onChange({ theme: { filters: { enabled } } })}
					overlay={overlay?.theme?.filters?.enabled}
				/>
				<SettingsSlider
					label="Contrast"
					value={settings.theme.filters.contrast}
					onChange={(contrast) => onChange({ theme: { filters: { contrast } } })}
					icon={<Contrast />}
					range={{
						min: 0.8,
						max: 1.2,
						step: 0.01,
					}}
					overlay={overlay?.theme?.filters?.contrast}
				/>
			</SettingsGroup> */}
		</SettingsGroup>
	);
}
