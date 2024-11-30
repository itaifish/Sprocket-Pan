import { useMemo } from 'react';
import { Box, List } from '@mui/joy';
import { useSelector } from 'react-redux';
import { selectRequests, selectEndpoints } from '../../../state/active/selectors';
import { EndpointRequest, Service } from '../../../types/application-data/application-data';
import { RecentRequestListItem } from './RecentRequestListItem';

interface RecentRequestsSectionProps {
	data: Service;
}

export function RecentRequestsSection({ data }: RecentRequestsSectionProps) {
	const requests = useSelector(selectRequests);
	const endpoints = useSelector(selectEndpoints);
	const recentRequests = useMemo(() => {
		const allRequests = data.endpointIds.flatMap((endpointId) => {
			const endpoint = endpoints[endpointId];
			if (endpoint != null) {
				return endpoint.requestIds
					.map((requestId) => {
						const request = requests[requestId];
						if (request == null) {
							return null as unknown as EndpointRequest;
						}
						return request;
					})
					.filter((request) => request != null);
			}
			return [];
		});
		return allRequests
			.sort((req1, req2) => {
				if (req1.history.length == 0 && req2.history.length == 0) {
					return req1.name.localeCompare(req2.name);
				}
				if (req1.history.length == 0) {
					return 1;
				}
				if (req2.history.length == 0) {
					return -1;
				}
				const req1MostRecent = req1.history[req1.history.length - 1].request.dateTime;
				const req2MostRecent = req2.history[req2.history.length - 1].request.dateTime;
				const difference = req2MostRecent - req1MostRecent;
				if (difference != 0) {
					return difference;
				}
				return req2.history.length - req1.history.length;
			})
			.slice(0, 20);
	}, [data]);

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
