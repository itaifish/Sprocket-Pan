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
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
						<path
							fill="currentColor"
							stroke="black"
							d="M8 2a6 6 0 1 0 0 12A6 6 0 0 0 8 2M5.5 8H7l.09.008A.5.5 0 0 1 7 9h-.333a1.667 1.667 0 0 0 2.533.156a.5.5 0 1 1 .72.694A2.665 2.665 0 0 1 6 9.764v.237l-.008.09a.5.5 0 0 1-.992-.09V8.5l.008-.09A.5.5 0 0 1 5.5 8M8 5.334a2.66 2.66 0 0 1 2 .903v-.234l.008-.09a.5.5 0 0 1 .992.09V7.5l-.008.09A.5.5 0 0 1 10.5 8H9.004l-.09-.008A.5.5 0 0 1 9.004 7h.329a1.667 1.667 0 0 0-2.537-.152a.5.5 0 0 1-.723-.691A2.66 2.66 0 0 1 8 5.334"
						/>
					</svg>
				</Box>
			)}
		</Box>
	);
}