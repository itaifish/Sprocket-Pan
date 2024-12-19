import { useMemo } from 'react';
import { Box, List } from '@mui/joy';
import { useSelector } from 'react-redux';
import { RecentRequestListItem } from './RecentRequestListItem';
import { selectRequests, selectEndpoints, selectHistory } from '@/state/active/selectors';
import { Service } from '@/types/data/workspace';

interface RecentRequestsSectionProps {
	service: Service;
}

export function RecentRequestsSection({ service }: RecentRequestsSectionProps) {
	const requests = useSelector(selectRequests);
	const histories = useSelector(selectHistory);
	const endpoints = useSelector(selectEndpoints);
	const recentRequests = useMemo(
		() =>
			service.endpointIds
				.flatMap((endpointId) => endpoints[endpointId]?.requestIds.map((requestId) => requests[requestId]))
				.filter((request) => request != null)
				.sort((req1, req2) => {
					const history1 = histories[req1.id] ?? [];
					const history2 = histories[req2.id] ?? [];
					if (history1.length == 0 && history2.length == 0) {
						return req1.name.localeCompare(req2.name);
					}
					if (history1.length == 0) {
						return 1;
					}
					if (history2.length == 0) {
						return -1;
					}
					const req1MostRecent = history1[history1.length - 1].request.dateTime;
					const req2MostRecent = history2[history2.length - 1].request.dateTime;
					const difference = req2MostRecent - req1MostRecent;
					if (difference != 0) {
						return difference;
					}
					return history2.length - history1.length;
				})
				.slice(0, 20),
		[service],
	);

	return (
		<List>
			{recentRequests.map((request, index) => (
				<Box key={index}>
					<RecentRequestListItem request={request} />
				</Box>
			))}
		</List>
	);
}
