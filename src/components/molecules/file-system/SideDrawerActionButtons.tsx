import { Stack } from '@mui/joy';
import { NewServiceButton } from '../../atoms/buttons/NewServiceButton';
import { SaveButton } from '../../atoms/buttons/SaveButton';
import { NewButton } from '../../atoms/buttons/NewButton';
import { OpenSettingsButton } from '../../atoms/buttons/OpenSettingsButton';

export function SideDrawerActionButtons() {
	return (
		<Stack direction={'row'} spacing={2}>
			<NewServiceButton />
			<NewButton />
			<SaveButton />
			<OpenSettingsButton />
		</Stack>
	);
}
