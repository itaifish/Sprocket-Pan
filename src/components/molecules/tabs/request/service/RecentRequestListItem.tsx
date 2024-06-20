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
import { EndpointRequest, iconFromTabType } from '../../../../../types/application-data/application-data';
import { tabsManager } from '../../../../../managers/TabsManager';
import { formatDate } from '../../../../../utils/string';
import { SprocketTooltip } from '../../../../atoms/SprocketTooltip';
import { TabsContext } from '../../../../../managers/GlobalContextManager';
import { useContext } from 'react';
import EventIcon from '@mui/icons-material/Event';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

interface RecentRequestListItemProps {
	request: EndpointRequest;
}

export function RecentRequestListItem({ request }: RecentRequestListItemProps) {
	const tabsContext = useContext(TabsContext);

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
								? formatDate(new Date(request.history[request.history.length - 1].request.dateTime))
								: 'Never'}
						</Typography>
						<SprocketTooltip text={`Open "${request.name}" request`}>
							<IconButton
								color="primary"
								onClick={() => {
									tabsManager.selectTab(tabsContext, request.id, 'request');
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
