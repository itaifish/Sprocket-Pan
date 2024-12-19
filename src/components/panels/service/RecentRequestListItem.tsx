import { IconButton, ListItem, ListItemContent, Stack, Typography } from '@mui/joy';
import EventIcon from '@mui/icons-material/Event';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { SprocketTooltip } from '@/components/shared/SprocketTooltip';
import { tabTypeIcon } from '@/constants/components';
import { useAppDispatch } from '@/state/store';
import { tabsActions } from '@/state/tabs/slice';
import { EndpointRequest } from '@/types/data/workspace';
import { formatFullDate } from '@/utils/string';
import { useSelector } from 'react-redux';
import { selectEndpointById, selectHistoryById } from '@/state/active/selectors';
import { EllipsisTypography } from '@/components/shared/EllipsisTypography';

interface RecentRequestListItemProps {
	request: EndpointRequest;
}

export function RecentRequestListItem({ request }: RecentRequestListItemProps) {
	const history = useSelector((state) => selectHistoryById(state, request.id));
	const endpoint = useSelector((state) => selectEndpointById(state, request.endpointId));
	const dispatch = useAppDispatch();

	return (
		<>
			<ListItem>
				<ListItemContent>
					<Stack direction="row" alignItems="center" columnGap={1} rowGap={0} maxWidth="100%" flexWrap="wrap">
						<Stack direction="row" alignItems="center" gap={1}>
							{tabTypeIcon.endpoint}
							<EllipsisTypography maxWidth="250px">{endpoint.name}</EllipsisTypography>
							{tabTypeIcon.request}
							<EllipsisTypography maxWidth="250px">{request.name}</EllipsisTypography>
						</Stack>
						<Stack direction="row" alignItems="center" gap={1}>
							<EventIcon />
							<Typography level="title-sm" width="fit-content">
								{history.length > 0 ? formatFullDate(new Date(history[history.length - 1].request.dateTime)) : 'Never'}
							</Typography>
							<SprocketTooltip text="Open Request">
								<IconButton
									color="primary"
									onClick={() => {
										dispatch(tabsActions.addTabs({ [request.id]: 'request' }));
										dispatch(tabsActions.setSelectedTab(request.id));
									}}
								>
									<OpenInNewIcon />
								</IconButton>
							</SprocketTooltip>
						</Stack>
					</Stack>
				</ListItemContent>
			</ListItem>
		</>
	);
}
