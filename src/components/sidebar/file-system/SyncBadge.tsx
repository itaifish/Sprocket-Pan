import { selectSyncMetadata, selectSettings } from '@/state/active/selectors';
import { Box } from '@mui/joy';
import { PropsWithChildren } from 'react';
import { useSelector } from 'react-redux';

interface SyncBadgeProps extends PropsWithChildren {
	id: string;
}

export function SyncBadge({ id, children }: SyncBadgeProps) {
	const sync = useSelector(selectSyncMetadata);
	const settings = useSelector(selectSettings);
	const isSync = sync.items[id];
	const isSyncEnabled = settings.data.sync.enabled;

	return (
		<Box>
			{children}
			{isSyncEnabled && isSync && <Box height={0} sx={{ outline: '1px solid red' }} />}
		</Box>
	);
}
