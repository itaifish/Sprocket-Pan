import { ListItemDecorator, IconButton, Tab as MuiTab, Stack } from '@mui/joy';
import { Environment } from 'monaco-editor';
import { useSelector } from 'react-redux';
import { selectTabInfoById } from '../../state/active/selectors';
import { iconFromTabType } from '../../types/application-data/application-data';
import { TabType } from '../../types/state/state';
import { Close } from '@mui/icons-material';
import { useAppDispatch } from '../../state/store';
import { EllipsisTypography } from '../shared/EllipsisTypography';
import { tabsActions } from '../../state/tabs/slice';

interface TabProps {
	tab: [string, TabType];
}

export function Tab({ tab }: TabProps) {
	const [tabId, tabType] = tab;
	const dispatch = useAppDispatch();
	const tabData = useSelector((state) => selectTabInfoById(state, tab));
	const name = tabData?.name ?? (tabData as Environment)?.__name ?? '';
	return (
		<MuiTab
			indicatorPlacement="top"
			value={tabId}
			id={`tab_${tabId}`}
			sx={{
				minWidth: 230,
				maxWidth: 460,
				scrollSnapAlign: 'start',
			}}
		>
			<Stack direction="row" flexWrap="nowrap" alignItems="center" justifyContent="space-between" width="100%">
				<ListItemDecorator sx={{ flex: 0 }}>{iconFromTabType[tabType]}</ListItemDecorator>
				<EllipsisTypography>{name}</EllipsisTypography>
				<ListItemDecorator sx={{ flex: 0 }}>
					<IconButton
						color="danger"
						onClick={(e) => {
							dispatch(tabsActions.closeTab(tabId));
							e.stopPropagation();
						}}
						size="sm"
					>
						<Close />
					</IconButton>
				</ListItemDecorator>
			</Stack>
		</MuiTab>
	);
}
