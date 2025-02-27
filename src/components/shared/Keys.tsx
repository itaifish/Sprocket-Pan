import { Command, ShortcutManager } from '@/managers/ShortcutManager';
import { Chip } from '@mui/joy';

interface KeysProps {
	commands: Command[];
}

export function Keys({ commands }: KeysProps) {
	return (
		<Chip component="span" size="sm" variant="outlined">
			<code>{ShortcutManager.getKeys(commands)}</code>
		</Chip>
	);
}
