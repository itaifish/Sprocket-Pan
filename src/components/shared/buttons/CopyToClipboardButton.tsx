import { IconButton, Box, IconButtonProps } from '@mui/joy';
import { SprocketTooltip } from '../SprocketTooltip';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { PropsWithChildren, useState } from 'react';
import { DownloadDone } from '@mui/icons-material';

interface CopyToClipboardButtonProps extends PropsWithChildren, IconButtonProps {
	tooltipText?: string;
	copyText: string;
}

export function CopyToClipboardButton({
	tooltipText = 'Copy to Clipboard',
	children = <ContentCopyIcon />,
	copyText,
	...props
}: CopyToClipboardButtonProps) {
	const [copied, setCopied] = useState(false);
	return (
		<Box position="relative">
			<SprocketTooltip text={tooltipText}>
				<IconButton
					color={copied ? 'success' : 'neutral'}
					onClick={() => {
						setCopied(true);
						setTimeout(() => {
							setCopied(false);
						}, 800);
						navigator.clipboard.writeText(copyText);
					}}
					{...props}
				>
					{copied ? <DownloadDone /> : children}
				</IconButton>
			</SprocketTooltip>
		</Box>
	);
}
