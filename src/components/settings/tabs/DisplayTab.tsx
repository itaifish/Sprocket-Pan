import { Stack } from '@mui/joy';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import { SettingsTabProps } from './types';
import { SettingsSelect, SettingsSlider } from './SettingsFields';
import { SettingsGroup } from '../SettingsGroup';
import { ThemeSelection } from './ThemeSelection';
import { LIST_STYLING, SCROLLBAR_VISIBILITY } from '@/types/data/settings';

export function DisplayTab({ overlay, settings, onChange }: SettingsTabProps) {
	return (
		<Stack spacing={3}>
			<SettingsGroup title="Spacing">
				<SettingsSlider
					value={settings.theme.zoom}
					overlay={overlay?.theme?.zoom}
					label="Zoom"
					onChange={(zoom) => onChange({ theme: { zoom } })}
					endDecorator="%"
					icon={<ZoomInIcon />}
					range={{ min: 25, max: 175 }}
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
			</SettingsGroup>
			<ThemeSelection overlay={overlay} onChange={onChange} settings={settings} />
		</Stack>
	);
}
