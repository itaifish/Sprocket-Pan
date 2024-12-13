import { Box, IconButton, ListItem, ListItemContent, ListItemDecorator, Stack, Typography } from '@mui/joy';
import EventIcon from '@mui/icons-material/Event';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { SprocketTooltip } from '@/components/shared/SprocketTooltip';
import { tabTypeIcon } from '@/constants/components';
import { useAppDispatch } from '@/state/store';
import { tabsActions } from '@/state/tabs/slice';
import { EndpointRequest } from '@/types/data/workspace';
import { formatFullDate } from '@/utils/string';

interface RecentRequestListItemProps {
	request: EndpointRequest;
}

export function RecentRequestListItem({ request }: RecentRequestListItemProps) {
	const dispatch = useAppDispatch();

	return (
		<>
			<ListItem>
				<ListItemDecorator sx={{ mr: '5px' }}>
					<Box sx={{ mr: '5px' }}>{tabTypeIcon.request}</Box>
					{request.name}
				</ListItemDecorator>
				<ListItemContent>
					<Stack direction="row" alignItems="center" gap={1}>
						<EventIcon />
						<Typography level="title-sm">
							{request.history.length > 0
								? formatFullDate(new Date(request.history[request.history.length - 1].request.dateTime))
								: 'Never'}
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
				</ListItemContent>
			</ListItem>
		</>
	);
}
