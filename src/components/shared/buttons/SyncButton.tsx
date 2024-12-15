import { selectSettings, selectSyncMetadata } from '@/state/active/selectors';
import { useAppDispatch } from '@/state/store';
import { Sync, SyncDisabled } from '@mui/icons-material';
import { IconButton } from '@mui/joy';
import { useSelector } from 'react-redux';
import { SprocketTooltip } from '../SprocketTooltip';
import { toggleSync } from '@/state/active/thunks/data';

interface SyncButtonProps {
	id: string;
}

export function SyncButton({ id }: SyncButtonProps) {
	const sync = useSelector(selectSyncMetadata);
	const settings = useSelector(selectSettings);
	const enabled = sync.items[id] ?? false;
	const dispatch = useAppDispatch();

	if (settings.data.sync.enabled) {
		return (
			<SprocketTooltip placement="left" text={enabled ? 'Disable Sync' : 'Enable Sync'}>
				<IconButton onClick={() => dispatch(toggleSync(id))}>
					{enabled ? <Sync color="success" /> : <SyncDisabled />}
				</IconButton>
			</SprocketTooltip>
		);
	}

	return null;
}
