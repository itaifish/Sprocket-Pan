import { FluentSync } from '@/assets/icons/fluent/FluentSync';
import { useShowSync } from '@/hooks/useShowSync';
import { Box } from '@mui/joy';
import { PropsWithChildren } from 'react';

interface SyncBadgeProps extends PropsWithChildren {
	id: string;
	bottom?: number;
	right?: number;
}

export function SyncBadge({ id, children, bottom = 0, right = 0 }: SyncBadgeProps) {
	const showSync = useShowSync(id);
	return (
		<Box position="relative">
			{children}
			{showSync && (
				<Box sx={{ position: 'absolute', pointerEvents: 'none', bottom: -4 + bottom, right: -4 + right }}>
					<FluentSync stroke="black" sx={{ height: '16px' }} />
				</Box>
			)}
		</Box>
	);
}
