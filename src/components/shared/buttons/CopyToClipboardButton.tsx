import { Tooltip, IconButton, Box } from '@mui/joy';
import { SprocketTooltip } from '../SprocketTooltip';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { PropsWithChildren, useState } from 'react';

interface CopyToClipboardButtonProps extends PropsWithChildren {
	tooltipText?: string;
	copyText: string;
}

export function CopyToClipboardButton({
	tooltipText = 'Copy to clipboard',
	children = <ContentCopyIcon />,
	copyText,
}: CopyToClipboardButtonProps) {
	const [copied, setCopied] = useState(false);
	return (
		<SprocketTooltip text={tooltipText} disabled={copied}>
			<Box>
				<Tooltip title="✓ Copied to clipboard!" arrow open={copied} placement="right" color="primary">
					<IconButton
						disabled={copied}
						onClick={() => {
							setCopied(true);
							setTimeout(() => {
								setCopied(false);
							}, 800);
							navigator.clipboard.writeText(copyText);
						}}
					>
						{children}
					</IconButton>
				</Tooltip>
			</Box>
		</SprocketTooltip>
	);
}
