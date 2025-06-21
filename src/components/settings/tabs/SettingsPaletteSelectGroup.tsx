import { SettingsGroup } from '../SettingsGroup';
import { useShouldDisplayFromSearch } from './hooks';
import { SettingsPaletteSelect } from './SettingsFields';
import { SettingsTabProps } from './types';

export function SettingsPaletteSelectGroup({
	overlay,
	settings,
	searchText,
	onChange,
	onUpdateGlobal,
}: SettingsTabProps) {
	const shouldDisplay = useShouldDisplayFromSearch('color palettes', searchText);
	if (!shouldDisplay) {
		return <></>;
	}
	return (
		<SettingsGroup title="Palettes">
			<SettingsPaletteSelect
				label="Primary"
				value={settings.theme.colors.primary}
				overlay={overlay?.theme?.colors?.primary}
				onChange={(primary) => onChange({ theme: { colors: { primary } } })}
				onUpdateGlobal={(primary) => onUpdateGlobal({ theme: { colors: { primary } } })}
			/>
			<SettingsPaletteSelect
				label="Neutral"
				value={settings.theme.colors.neutral}
				overlay={overlay?.theme?.colors?.neutral}
				onChange={(neutral) => onChange({ theme: { colors: { neutral } } })}
				onUpdateGlobal={(neutral) => onUpdateGlobal({ theme: { colors: { neutral } } })}
			/>
			<SettingsPaletteSelect
				label="Danger"
				value={settings.theme.colors.danger}
				overlay={overlay?.theme?.colors?.danger}
				onChange={(danger) => onChange({ theme: { colors: { danger } } })}
				onUpdateGlobal={(danger) => onUpdateGlobal({ theme: { colors: { danger } } })}
			/>
			<SettingsPaletteSelect
				label="Success"
				value={settings.theme.colors.success}
				overlay={overlay?.theme?.colors?.success}
				onChange={(success) => onChange({ theme: { colors: { success } } })}
				onUpdateGlobal={(success) => onUpdateGlobal({ theme: { colors: { success } } })}
			/>
			<SettingsPaletteSelect
				label="Warning"
				value={settings.theme.colors.warning}
				overlay={overlay?.theme?.colors?.warning}
				onChange={(warning) => onChange({ theme: { colors: { warning } } })}
				onUpdateGlobal={(warning) => onUpdateGlobal({ theme: { colors: { warning } } })}
			/>
		</SettingsGroup>
	);
}
