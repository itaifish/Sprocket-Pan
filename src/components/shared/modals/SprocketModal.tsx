import { Close } from '@mui/icons-material';
import { Box, IconButton, IconButtonProps, Modal, ModalProps, Sheet } from '@mui/joy';

function CloseModalButton(props: IconButtonProps) {
	return (
		<IconButton {...props}>
			<Close />
		</IconButton>
	);
}

interface SprocketModalProps extends ModalProps {
	setClosed?: () => void;
}

export function SprocketModal({ children, setClosed, ...props }: SprocketModalProps) {
	return (
		<Modal {...props}>
			<Sheet
				sx={{
					position: 'absolute' as const,
					top: '50%',
					left: '50%',
					transform: 'translate(-50%, -50%)',
					width: '75vw',
					bgcolor: 'background.grey',
					border: '2px solid #000',
					boxShadow: 24,
					p: 4,
				}}
			>
				{setClosed == null ? null : (
					<Box sx={{ float: 'right' }}>
						<CloseModalButton onClick={setClosed} />
					</Box>
				)}
				{children}
			</Sheet>
		</Modal>
	);
}
