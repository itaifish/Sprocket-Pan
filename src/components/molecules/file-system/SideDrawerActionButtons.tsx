import { Stack } from '@mui/joy';
import { NewServiceButton } from '../../atoms/buttons/NewServiceButton';
import { SaveButton } from '../../atoms/buttons/SaveButton';
import { ThemeToggleButton } from '../../atoms/buttons/ThemeToggleButton';

export function SideDrawerActionButtons() {
	return (
		<Stack direction={'row'} spacing={2}>
			<ThemeToggleButton />
			<NewServiceButton />
			<SaveButton />
		</Stack>
	);
}
