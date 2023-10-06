import { Stack } from '@mui/joy';
import { NewServiceButton } from '../../atoms/buttons/NewServiceButton';
import { SaveButton } from '../../atoms/buttons/SaveButton';
import { ThemeToggleButton } from '../../atoms/buttons/ThemeToggleButton';
import { NewButton } from '../../atoms/buttons/NewButton';

export function SideDrawerActionButtons() {
	return (
		<Stack direction={'row'} spacing={2}>
			<ThemeToggleButton />
			<NewServiceButton />
			<NewButton />
			<SaveButton />
		</Stack>
	);
}
