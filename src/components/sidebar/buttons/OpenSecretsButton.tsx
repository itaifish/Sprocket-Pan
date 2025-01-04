import { SprocketTooltip } from '@/components/shared/SprocketTooltip';
import { ELEMENT_ID } from '@/constants/uiElementIds';
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
					dispatch(uiActions.addTabs({ [ELEMENT_ID.secrets]: 'secrets' }));
					dispatch(uiActions.setSelectedTab(ELEMENT_ID.secrets));
				}}
			>
				<Key />
			</IconButton>
		</SprocketTooltip>
	);
}
