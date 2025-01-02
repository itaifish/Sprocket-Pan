import { selectSettings, selectSyncMetadata } from '@/state/active/selectors';
import { useAppDispatch } from '@/state/store';
import { Sync, SyncDisabled } from '@mui/icons-material';
import { IconButton, TooltipProps } from '@mui/joy';
import { useSelector } from 'react-redux';
import { SprocketTooltip } from '../SprocketTooltip';
import { toggleSync } from '@/state/active/thunks/data';

interface SyncButtonProps extends Pick<TooltipProps, 'placement' | 'variant'> {
	id: string;
}

export function SyncButton({ id, placement = 'left', variant }: SyncButtonProps) {
	const sync = useSelector(selectSyncMetadata);
	const settings = useSelector(selectSettings);
	const enabled = sync.items[id] ?? false;
	const dispatch = useAppDispatch();

	if (settings.data.sync.enabled) {
		return (
			<SprocketTooltip placement={placement} text={enabled ? 'Disable Sync' : 'Enable Sync'}>
				<IconButton color={enabled ? 'success' : 'neutral'} variant={variant} onClick={() => dispatch(toggleSync(id))}>
					{enabled ? <Sync /> : <SyncDisabled />}
				</IconButton>
			</SprocketTooltip>
		);
	}

	return null;
}
