import { Stack } from '@mui/joy';
import { CopyToClipboardButton } from '../buttons/CopyToClipboardButton';
import { FormatButton } from '../buttons/FormatButton';

interface EditorActionsProps {
	copyText?: string | null;
	format?: (() => void) | null;
}

export function EditorActions({ copyText, format }: EditorActionsProps) {
	return (
		<Stack direction="row">
			{copyText != null && <CopyToClipboardButton copyText={copyText} />}
			{format != null && <FormatButton onChange={format} />}
		</Stack>
	);
}
