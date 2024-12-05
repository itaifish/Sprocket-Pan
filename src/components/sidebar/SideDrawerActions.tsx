import { Stack } from '@mui/joy';
import { OpenSettingsButton } from '../settings/OpenSettingsButton';
import { NewButton } from './buttons/NewButton';
import { ImportFromFileButton } from './buttons/ImportFromFileButton';
import { SaveButton } from './buttons/SaveButton';
import { UndoRedoTabsButton } from '../header/UndoRedoTabsButton';
import { OpenSecretsButton } from './buttons/OpenSecretsButton';

export function SideDrawerActions() {
	return (
		<Stack direction="row" gap={2} justifyContent="space-between">
			<Stack direction="row" gap={1} flexWrap="wrap">
				<ImportFromFileButton />
				<NewButton />
				<SaveButton />
				<OpenSecretsButton />
				<OpenSettingsButton />
			</Stack>
			<UndoRedoTabsButton />
		</Stack>
	);
}
