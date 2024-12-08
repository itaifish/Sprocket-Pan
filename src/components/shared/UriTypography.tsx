import { BREAK_ALL_TEXT } from '../../styles/text';
import { COMMAND, ShortcutManager } from '../../managers/ShortcutManager';
import { open } from '@tauri-apps/api/shell';

interface UriTypographyProps {
	children: string;
}

export function UriTypography({ children }: UriTypographyProps) {
	return (
		<u>
			<span
				onClick={(event) => {
					if (ShortcutManager.translateClick(event) === COMMAND.meta) {
						open(children);
					}
				}}
				style={BREAK_ALL_TEXT}
			>
				{children}
			</span>
		</u>
	);
}
