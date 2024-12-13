import { Box } from '@mui/joy';
import { PropsWithChildren } from 'react';
import { open } from '@tauri-apps/api/shell';

interface AProps extends PropsWithChildren {
	href: string;
}

export function A({ href, children }: AProps) {
	return (
		<Box component="span" sx={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => open(href)}>
			{children}
		</Box>
	);
}
