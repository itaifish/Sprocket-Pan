import { ListItemDecorator, IconButton, Tab as MuiTab, Stack } from '@mui/joy';
import { Environment } from 'monaco-editor';
import { useSelector } from 'react-redux';
import {
	selectEnvironments,
	selectServices,
	selectRequests,
	selectEndpoints,
	selectScripts,
} from '../../state/active/selectors';
import { closeTab } from '../../state/tabs/slice';
import { ApplicationData, iconFromTabType } from '../../types/application-data/application-data';
import { TabType } from '../../types/state/state';
import { Close } from '@mui/icons-material';
import { useAppDispatch } from '../../state/store';
import { EllipsisTypography } from '../shared/EllipsisTypography';

function getMapFromTabType<TTabType extends TabType>(data: Pick<ApplicationData, `${TTabType}s`>, tabType: TTabType) {
	return data[`${tabType}s`];
}

interface TabProps {
	tab: [string, TabType];
}

export function Tab({ tab: [tabId, tabType] }: TabProps) {
	const environments = useSelector(selectEnvironments);
	const services = useSelector(selectServices);
	const requests = useSelector(selectRequests);
	const endpoints = useSelector(selectEndpoints);
	const scripts = useSelector(selectScripts);
	const dispatch = useAppDispatch();
	const tabData = getMapFromTabType({ environments, requests, services, endpoints, scripts }, tabType)[tabId];
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
							dispatch(closeTab(tabId));
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
