import { Key } from '@mui/icons-material';
import { IconButton } from '@mui/joy';
import { useAppDispatch } from '../../../state/store';
import { tabsActions } from '../../../state/tabs/slice';
import { ELEMENT_ID } from '../../../constants/uiElementIds';

export function OpenSecretsButton() {
	const dispatch = useAppDispatch();
	return (
		<IconButton
			id="toggle-mode"
			size="sm"
			variant="soft"
			color="neutral"
			onClick={() => {
				dispatch(tabsActions.addTabs({ [ELEMENT_ID.secrets]: 'secrets' }));
				dispatch(tabsActions.setSelectedTab(ELEMENT_ID.secrets));
			}}
		>
			<Key />
		</IconButton>
	);
}
