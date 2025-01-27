import { SprocketModal } from '@/components/shared/modals/SprocketModal';
import { Contrast } from '@mui/icons-material';
import { SettingsGroup } from '../SettingsGroup';
import { SettingsPaletteSelect, SettingsSwitch, SettingsSlider } from './SettingsFields';
import { useState } from 'react';
import { EditableText } from '@/components/shared/input/EditableText';
import { Button, Stack, ThemeProvider } from '@mui/joy';
import NotInterestedIcon from '@mui/icons-material/NotInterested';
import SaveIcon from '@mui/icons-material/Save';
import { Workspace } from '@/components/root/Workspace';
import { createTheme } from '@/utils/style';

type ThemeEditorModalProps = {
	open: boolean;
	close: () => void;
};

const defaults = {
	primary: '#005C8A',
	neutral: '#3F444A',
	danger: '#C41C1C',
	success: '#1F7A1F',
	warning: '#C06C0C',
};

export function ThemeEditorModal({ open, close }: ThemeEditorModalProps) {
	const [themeName, setThemeName] = useState('New Theme');
	const [primary, setPrimary] = useState(defaults.primary);
	const [neutral, setNeutral] = useState(defaults.neutral);
	const [danger, setDanger] = useState(defaults.danger);
	const [success, setSuccess] = useState(defaults.success);
	const [warning, setWarning] = useState(defaults.warning);
	const [filtersEnabled, setFiltersEnabled] = useState(true);
	const [contrast, setContrast] = useState(1);
	const newTheme = createTheme({ primary, neutral, danger, success, warning });
	const reset = () => {
		setThemeName('New Theme');
		setPrimary(defaults.primary);
		setNeutral(defaults.neutral);
		setDanger(defaults.danger);
		setSuccess(defaults.success);
		setWarning(defaults.warning);
		setFiltersEnabled(true);
		setContrast(1);
	};

	const resetAndClose = () => {
		reset();
		close();
	};

	return (
		<>
			<SprocketModal
				open={open}
				onClose={(_event: React.MouseEvent<HTMLButtonElement>, reason) => {
					if (reason === 'backdropClick') {
						return;
					}
					resetAndClose();
				}}
				setClosed={resetAndClose}
			>
				<>
					<EditableText
						size="lg"
						setText={(text) => setThemeName(text)}
						text={themeName}
						isValidFunc={(text) => text.length > 0}
						sx={{ justifyContent: 'center', alignItems: 'center', margin: 'auto' }}
					/>
					<Stack direction={'row'} justifyContent={'space-between'}>
						<SettingsGroup title="New Theme">
							<SettingsGroup title="Palettes">
								<SettingsPaletteSelect
									label="Primary"
									value={primary}
									onChange={(color) => setPrimary((oldPrimary) => color ?? oldPrimary)}
									overlay={undefined}
								/>
								<SettingsPaletteSelect
									label="Neutral"
									value={neutral}
									onChange={(neutral) => setNeutral((oldNeutral) => neutral ?? oldNeutral)}
									overlay={undefined}
								/>
								<SettingsPaletteSelect
									label="Danger"
									value={danger}
									onChange={(danger) => setDanger((oldDanger) => danger ?? oldDanger)}
									overlay={undefined}
								/>
								<SettingsPaletteSelect
									label="Success"
									value={success}
									onChange={(success) => setSuccess((oldSuccess) => success ?? oldSuccess)}
									overlay={undefined}
								/>
								<SettingsPaletteSelect
									label="Warning"
									value={warning}
									onChange={(warning) => setWarning((oldWarning) => warning ?? oldWarning)}
									overlay={undefined}
								/>
							</SettingsGroup>
							<SettingsGroup title="Color Adjustment">
								<SettingsSwitch
									sx={{ width: 240 }}
									label="Filters"
									checked={filtersEnabled}
									onChange={(enabled) => setFiltersEnabled((oldState) => enabled ?? oldState)}
									overlay={undefined}
								/>
								<SettingsSlider
									label="Contrast"
									value={contrast}
									disabled={!filtersEnabled}
									onChange={(contrast) => setContrast((oldContrast) => contrast ?? oldContrast)}
									icon={<Contrast />}
									range={{
										min: 0.8,
										max: 1.2,
										step: 0.01,
									}}
									overlay={undefined}
								/>
							</SettingsGroup>
						</SettingsGroup>
						<ThemeProvider theme={newTheme}>
							<Workspace sizeOverride={{ width: '800x', height: '600px' }} />
						</ThemeProvider>
						<></>
					</Stack>
					<Stack gap={1} direction="row-reverse">
						<Button startDecorator={<SaveIcon />} onClick={() => {}}>
							Create
						</Button>
						<Button color={'danger'} startDecorator={<NotInterestedIcon />} onClick={close}>
							Cancel
						</Button>
					</Stack>
				</>
			</SprocketModal>
		</>
	);
}
