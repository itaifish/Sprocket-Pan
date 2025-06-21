import { SprocketTooltip } from '@/components/shared/SprocketTooltip';
import { useAppDispatch } from '@/state/store';
import { uiActions } from '@/state/ui/slice';
import { Key } from '@mui/icons-material';
import { IconButton } from '@mui/joy';

export function OpenSecretsButton() {
	const dispatch = useAppDispatch();
	return (
		<SprocketTooltip text="Open User Secrets">
			<IconButton
				onClick={() => {
					dispatch(uiActions.addTab('secrets'));
					dispatch(uiActions.setSelectedTab('secrets'));
				}}
			>
				<Key />
			</IconButton>
		</SprocketTooltip>
	);
}
