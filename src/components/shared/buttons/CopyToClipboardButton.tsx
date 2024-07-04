import { Tooltip, IconButton } from '@mui/joy';
import { SprocketTooltip } from '../SprocketTooltip';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { Dispatch, SetStateAction } from 'react';

interface CopyToClipboardButtonProps {
	copied: boolean;
	setCopied: Dispatch<SetStateAction<boolean>>;
	text: string;
}

export function CopyToClipboardButton({ copied, setCopied, text }: CopyToClipboardButtonProps) {
	return (
		<SprocketTooltip text={'Copy to clipboard'} disabled={copied}>
			<Tooltip title="✓ Copied to clipboard!" arrow open={copied} placement="right" color="primary">
				<IconButton
					disabled={copied}
					onClick={() => {
						setCopied(true);
						setTimeout(() => {
							setCopied(false);
						}, 800);
						navigator.clipboard.writeText(text);
					}}
				>
					<ContentCopyIcon />
				</IconButton>
			</Tooltip>
		</SprocketTooltip>
	);
}
