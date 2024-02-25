import UndoRoundedIcon from '@mui/icons-material/UndoRounded';
import RedoRoundedIcon from '@mui/icons-material/RedoRounded';
import { Stack, IconButton } from '@mui/joy';
import { useContext, useEffect, useState } from 'react';
import { tabsManager } from '../../../managers/TabsManager';
import { TabsContext } from '../../../managers/GlobalContextManager';
import { SprocketTooltip } from '../SprocketTooltip';

export function UndoRedoTabsButton() {
	const [goBackIndex, setGoBackIndex] = useState<number | null>(null);
	const [goForwardIndex, setGoForwardIndex] = useState<number | null>(null);
	const tabsContext = useContext(TabsContext);

	useEffect(() => {
		const onTabSelected = () => {
			setGoBackIndex(tabsManager.peekHistoryPrevious());
			setGoForwardIndex(tabsManager.peekHistoryNext());
		};
		tabsManager.on('TabSelected', onTabSelected);
		return () => {
			tabsManager.removeListener('TabSelected', onTabSelected);
		};
	}, []);

	return (
		<Stack direction={'row'} spacing={0} justifyContent={'flex-end'}>
			<SprocketTooltip text="Previous Tab">
				<IconButton
					variant="outlined"
					disabled={goBackIndex == null}
					onClick={() => goBackIndex != null && tabsManager.selectTabFromHistory(tabsContext, goBackIndex)}
				>
					<UndoRoundedIcon />
				</IconButton>
			</SprocketTooltip>
			<SprocketTooltip text="Next Tab">
				<IconButton
					variant="outlined"
					disabled={goForwardIndex == null}
					onClick={() => goForwardIndex != null && tabsManager.selectTabFromHistory(tabsContext, goForwardIndex)}
				>
					<RedoRoundedIcon />
				</IconButton>
			</SprocketTooltip>
		</Stack>
	);
}
