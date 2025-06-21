import { selectSyncMetadata, selectSettings } from '@/state/active/selectors';
import { useSelector } from 'react-redux';

export function useShowSync(id: string) {
	const sync = useSelector(selectSyncMetadata);
	const settings = useSelector(selectSettings);
	return settings.data.sync.enabled && !!sync.items[id];
}
