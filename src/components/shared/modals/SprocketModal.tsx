import { Modal, ModalClose, ModalDialog, ModalProps, Stack, Typography } from '@mui/joy';
import { ReactNode } from 'react';

const allCloseOn = ['backdropClick', 'escapeKeyDown', 'closeClick'] as const;

const sizeStyling = {
	sm: { width: '400px', height: '240px' },
	md: { width: '600px', height: '400px' },
	lg: { width: '80%', height: '80%' },
	full: undefined,
} as const;

interface SprocketModalProps extends Omit<ModalProps, 'onClose' | 'title'> {
	actions?: ReactNode;
	onClose?: () => void;
	closeOn?: ('backdropClick' | 'escapeKeyDown' | 'closeClick')[];
	size?: keyof typeof sizeStyling;
	title?: ReactNode;
}

export function SprocketModal({
	children,
	onClose,
	closeOn = allCloseOn.slice(),
	actions,
	title,
	size = 'md',
	...props
}: SprocketModalProps) {
	return (
		<Modal
			{...props}
			onClose={(_, reason) => {
				if (closeOn.includes(reason)) onClose?.();
			}}
		>
			<ModalDialog sx={{ ...sizeStyling[size], maxWidth: '100%' }} layout={size == 'full' ? 'fullscreen' : 'center'}>
				{closeOn.includes('closeClick') && <ModalClose />}
				{title != null && <Typography level="title-lg">{title}</Typography>}
				{children}
				<Stack sx={{ position: 'absolute', bottom: '10px', width: 'calc(100% - 40px)' }} direction="row" gap={2}>
					{actions}
				</Stack>
			</ModalDialog>
		</Modal>
	);
}
