import { Chip } from '@mui/joy';
import { COMMAND, ShortcutManager } from '../../managers/ShortcutManager';

interface KeysProps {
	commands: COMMAND[];
}

export function Keys({ commands }: KeysProps) {
	return (
		<Chip component="span" size="sm" variant="outlined">
			<code>{ShortcutManager.getKeys(commands)}</code>
		</Chip>
	);
}
