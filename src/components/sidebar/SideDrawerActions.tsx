import { Stack } from '@mui/joy';
import { OpenSettingsButton } from '../settings/OpenSettingsButton';
import { NewButton } from './buttons/NewButton';
import { ImportFromFileButton } from './buttons/ImportFromFileButton';
import { SaveButton } from './buttons/SaveButton';
import { UndoRedoTabsButton } from '../header/UndoRedoTabsButton';

export function SideDrawerActions() {
	return (
		<Stack direction={'row'} spacing={3}>
			<Stack direction={'row'} spacing={2}>
				<ImportFromFileButton />
				<NewButton />
				<SaveButton />
				<OpenSettingsButton />
			</Stack>
			<UndoRedoTabsButton />
		</Stack>
	);
}
