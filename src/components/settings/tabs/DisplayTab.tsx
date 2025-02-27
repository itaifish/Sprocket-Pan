import { Stack } from '@mui/joy';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import { SettingsTabProps } from './types';
import { SettingsSelect, SettingsSlider, SettingsSwitch } from './SettingsFields';
import { BaseTheme, ListStyling, ScrollbarVisibility } from '@/types/data/settings';
import { Contrast, Opacity } from '@mui/icons-material';
import { SettingsGroup } from '../SettingsGroup';
import { SettingsPaletteSelectGroup } from './SettingsPaletteSelectGroup';

export function DisplayTab({ overlay, settings, searchText, onChange, onUpdateGlobal }: SettingsTabProps) {
	return (
		<Stack spacing={3}>
			<SettingsGroup title="Spacing">
				<SettingsSlider
					value={settings.theme.zoom}
					overlay={overlay?.theme?.zoom}
					searchText={searchText}
					label="Zoom"
					onChange={(zoom) => onChange({ theme: { zoom } })}
					onUpdateGlobal={(zoom) => onUpdateGlobal({ theme: { zoom } })}
					endDecorator="%"
					icon={<ZoomInIcon />}
					range={{ min: 25, max: 175 }}
				/>
				<SettingsSelect
					sx={{ width: 240 }}
					label="List Style"
					searchText={searchText}
					value={settings.theme.list}
					overlay={overlay?.theme?.list}
					onChange={(val) => onChange({ theme: { list: val } })}
					onUpdateGlobal={(val) => onUpdateGlobal({ theme: { list: val } })}
					options={[
						{ value: ListStyling.compact, label: 'Compact' },
						{ value: ListStyling.default, label: 'Default' },
						{ value: ListStyling.cozy, label: 'Cozy' },
					]}
				/>
				<SettingsSelect
					sx={{ width: 240 }}
					label="Scrollbar Visibility"
					searchText={searchText}
					value={settings.theme.scrollbarVisibility}
					overlay={overlay?.theme?.scrollbarVisibility}
					onChange={(val) => onChange({ theme: { scrollbarVisibility: val } })}
					onUpdateGlobal={(val) => onUpdateGlobal({ theme: { scrollbarVisibility: val } })}
					options={[
						{ value: ScrollbarVisibility.compact, label: 'Compact' },
						{ value: ScrollbarVisibility.hidden, label: 'Invisible' },
						{ value: ScrollbarVisibility.visible, label: 'Visible' },
					]}
				/>
			</SettingsGroup>
			<SettingsGroup title="Theme">
				<SettingsSelect
					sx={{ width: 240 }}
					label="Base Theme"
					searchText={searchText}
					value={settings.theme.base}
					overlay={overlay?.theme?.base}
					onChange={(base) => onChange({ theme: { base } })}
					onUpdateGlobal={(base) => onUpdateGlobal({ theme: { base } })}
					options={[
						{ value: BaseTheme.light, label: 'Light Mode' },
						{ value: BaseTheme.dark, label: 'Dark Mode' },
						{ value: BaseTheme.default, label: 'System Default' },
					]}
				/>
				<SettingsSlider
					value={settings.theme.decoration.opacity}
					overlay={overlay?.theme?.decoration?.opacity}
					searchText={searchText}
					label="Decoration Opacity"
					onChange={(opacity) => onChange({ theme: { decoration: { opacity } } })}
					onUpdateGlobal={(opacity) => onUpdateGlobal({ theme: { decoration: { opacity } } })}
					icon={<Opacity />}
					range={{ min: 0, max: 1, step: 0.05 }}
				/>
				<SettingsPaletteSelectGroup {...{ overlay, settings, searchText, onChange, onUpdateGlobal }} />
				<SettingsGroup title="Color Adjustment">
					<SettingsSwitch
						sx={{ width: 240 }}
						searchText={searchText}
						label="Filters"
						checked={settings.theme.filters.enabled}
						onChange={(enabled) => onChange({ theme: { filters: { enabled } } })}
						onUpdateGlobal={(enabled) => onUpdateGlobal({ theme: { filters: { enabled } } })}
						overlay={overlay?.theme?.filters?.enabled}
					/>
					<SettingsSlider
						label="Contrast"
						searchText={searchText}
						value={settings.theme.filters.contrast}
						onChange={(contrast) => onChange({ theme: { filters: { contrast } } })}
						onUpdateGlobal={(contrast) => onUpdateGlobal({ theme: { filters: { contrast } } })}
						icon={<Contrast />}
						range={{
							min: 0.8,
							max: 1.2,
							step: 0.01,
						}}
						overlay={overlay?.theme?.filters?.contrast}
					/>
				</SettingsGroup>
			</SettingsGroup>
		</Stack>
	);
}
