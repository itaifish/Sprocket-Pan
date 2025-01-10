import { selectToast } from '@/state/ui/selectors';
import { Close, Info, Warning } from '@mui/icons-material';
import { ColorPaletteProp, IconButton, Snackbar, Stack } from '@mui/joy';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

export interface ToastProps {
	message?: string;
	color?: ColorPaletteProp;
	details?: string;
}

// this is intended for expansion into stacked/multi-toasts
// but for now only supports a single toast at a time.
export function Toasts() {
	const [open, setOpen] = useState(false);
	const toast = useSelector(selectToast);
	useEffect(() => {
		if (toast == null) {
			setOpen(false);
		} else {
			setOpen(true);
		}
	}, [toast]);
	return (
		<Snackbar
			sx={{ maxWidth: '900px' }}
			startDecorator={toast?.color === 'danger' || toast?.color === 'warning' ? <Warning /> : <Info />}
			variant="soft"
			open={open}
			color={toast?.color}
			onClose={() => setOpen(false)}
			endDecorator={
				<IconButton variant="soft" color={toast?.color} onClick={() => setOpen(false)}>
					<Close />
				</IconButton>
			}
		>
			<Stack gap={2}>
				{toast?.message}
				{toast?.details}
			</Stack>
		</Snackbar>
	);
}
