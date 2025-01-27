import { Opacity } from '@mui/icons-material';
import { SettingsGroup } from '../SettingsGroup';
import { SettingsSelect, SettingsSlider } from './SettingsFields';
import { SettingsTabProps } from './types';
import { BASE_THEME } from '@/types/data/sprocketTheme';
import { useSelector } from 'react-redux';
import { selectGlobalThemes } from '@/state/global/selectors';
import { useState } from 'react';
import { SprocketTooltip } from '@/components/shared/SprocketTooltip';
import { IconButton, Stack } from '@mui/joy';
import { FluentNewBeaker } from '@/assets/icons/fluent/FluentNewBeaker';
import { ThemeEditorModal } from './ThemeEditorModal';

export function ThemeSelection({ overlay, settings, onChange }: SettingsTabProps) {
	const globalThemes = useSelector(selectGlobalThemes);
	const [createModalOpen, setCreateModalOpen] = useState(false);
	return (
		<SettingsGroup title="Theme">
			<Stack direction={'row'}>
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
				<SprocketTooltip text="Create New Theme">
					<IconButton onClick={() => setCreateModalOpen(true)}>
						<FluentNewBeaker />
					</IconButton>
				</SprocketTooltip>
			</Stack>
			<ThemeEditorModal open={createModalOpen} close={() => setCreateModalOpen(false)} />
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
		</SettingsGroup>
	);
}
