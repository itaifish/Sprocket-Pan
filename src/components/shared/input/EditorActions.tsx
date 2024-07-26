import { Stack } from '@mui/joy';
import { CopyToClipboardButton } from '../buttons/CopyToClipboardButton';
import { FormatIcon } from '../buttons/FormatIcon';

interface EditorActionsProps {
	copyText?: string | null;
	format?: (() => void) | null;
}

export function EditorActions({ copyText, format }: EditorActionsProps) {
	return (
		<Stack direction={'row'}>
			{copyText != null && <CopyToClipboardButton copyText={copyText} />}
			{format != null && <FormatIcon actionFunction={format} />}
		</Stack>
	);
}
