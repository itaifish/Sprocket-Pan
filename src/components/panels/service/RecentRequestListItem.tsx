import {
	Box,
	IconButton,
	ListDivider,
	ListItem,
	ListItemContent,
	ListItemDecorator,
	Stack,
	Typography,
} from '@mui/joy';
import EventIcon from '@mui/icons-material/Event';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useAppDispatch } from '../../../state/store';
import { EndpointRequest, iconFromTabType } from '../../../types/application-data/application-data';
import { formatFullDate } from '../../../utils/string';
import { SprocketTooltip } from '../../shared/SprocketTooltip';
import { tabsActions } from '../../../state/tabs/slice';

interface RecentRequestListItemProps {
	request: EndpointRequest;
}

export function RecentRequestListItem({ request }: RecentRequestListItemProps) {
	const dispatch = useAppDispatch();

	return (
		<>
			<ListItem>
				<ListItemDecorator sx={{ mr: '5px' }}>
					<Box sx={{ mr: '5px' }}>{iconFromTabType.request}</Box>
					{request.name}
				</ListItemDecorator>
				<ListItemContent>
					<Stack direction="row" alignItems={'center'} gap={1}>
						<EventIcon />
						<Typography level="title-sm">
							{request.history.length > 0
								? formatFullDate(new Date(request.history[request.history.length - 1].request.dateTime))
								: 'Never'}
						</Typography>
						<SprocketTooltip text={`Open "${request.name}" request`}>
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
			<ListDivider inset="gutter" />
		</>
	);
}
