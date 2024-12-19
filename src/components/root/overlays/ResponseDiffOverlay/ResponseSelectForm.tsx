import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { SearchableRequestDropdown } from './SearchableRequestDropdown';
import { FormControl, FormLabel, Stack, Typography } from '@mui/joy';
import { SxProps } from '@mui/joy/styles/types';
import { ResponseState } from '@/components/panels/request/RequestActions';
import { responseStateToNumber, HistoryControl } from '@/components/panels/request/response/HistoryControl';
import { selectServices, selectEndpoints, selectRequests, selectHistory } from '@/state/active/selectors';
import { BREAK_ALL_TEXT } from '@/styles/text';
import { EndpointRequest, Endpoint, Service } from '@/types/data/workspace';
import { formatShortFullDate } from '@/utils/string';

export type SelectedResponse = { id: string; index: number };

interface ResponseSelectFormProps {
	onChange: (args: SelectedResponse | null) => void;
	initialValue: SelectedResponse | null;
	collapsed?: boolean;
	sx?: SxProps;
}

export function ResponseSelectForm({ onChange, initialValue, collapsed = false, sx }: ResponseSelectFormProps) {
	const services = useSelector(selectServices);
	const endpoints = useSelector(selectEndpoints);
	const requests = useSelector(selectRequests);
	const histories = useSelector(selectHistory);

	const [selectedHistoryIndex, setSelectedHistoryIndex] = useState<number>(0);
	const [selectedRequest, setSelectedResponse] = useState<EndpointRequest | null>(null);
	const [selectedEndpoint, setSelectedEndpoint] = useState<Endpoint | null>(null);
	const [selectedService, setSelectedService] = useState<Service | null>(null);

	const selectableServices = Object.values(services);
	const selectableEndpoints = selectedService?.endpointIds.map((endpointId) => endpoints[endpointId]) ?? [];
	const selectableRequests = selectedEndpoint?.requestIds.map((requestId) => requests[requestId]) ?? [];

	const setRequest = (value: string | null, stateIndex: ResponseState = 'latest') => {
		const request = value == null ? null : requests[value];
		const history = value == null ? null : histories[value];
		const index = responseStateToNumber(stateIndex, history?.length);
		setSelectedResponse(request);
		setSelectedHistoryIndex(index);
		onChange(request == null ? null : { id: request.id, index });
	};

	const setEndpoint = (value: string | null) => {
		const endpoint = value == null ? null : endpoints[value];
		setSelectedEndpoint(endpoint);
		setRequest(null);
	};

	const setService = (value: string | null) => {
		const service = value == null ? null : services[value];
		setSelectedService(service);
		setEndpoint(null);
	};

	useEffect(() => {
		if (initialValue == null) {
			setService(null);
			return;
		}
		const request = requests[initialValue.id];
		const endpoint = endpoints[request?.endpointId];
		const service = services[endpoint?.serviceId];
		setSelectedHistoryIndex(initialValue.index);
		setSelectedResponse(request);
		setSelectedEndpoint(endpoint);
		setSelectedService(service);
	}, []);

	const selectedHistory = selectedRequest == null ? null : histories[selectedRequest.id];
	const historyDate = selectedHistory?.[selectedHistoryIndex]?.request.dateTime;

	return (
		<Stack gap={1} sx={sx}>
			{collapsed ? (
				<Typography level="body-sm" sx={BREAK_ALL_TEXT}>
					{selectedService?.name} / {selectedEndpoint?.name} / {selectedRequest?.name}
				</Typography>
			) : (
				<>
					<SearchableRequestDropdown
						name="service"
						selected={selectedService}
						onChange={setService}
						options={selectableServices}
					/>
					<SearchableRequestDropdown
						name="endpoint"
						selected={selectedEndpoint}
						onChange={setEndpoint}
						options={selectableEndpoints}
					/>
					<SearchableRequestDropdown
						name="request"
						selected={selectedRequest}
						onChange={setRequest}
						options={selectableRequests}
					/>
				</>
			)}
			<FormControl>
				{!collapsed && <FormLabel>History Item</FormLabel>}
				<Stack direction="row" alignItems="center">
					<HistoryControl
						value={selectedHistoryIndex}
						historyLength={selectedHistory?.length ?? 0}
						onChange={(state) => setRequest(selectedRequest?.id ?? null, state)}
					/>
					{historyDate != null && formatShortFullDate(historyDate)}
				</Stack>
			</FormControl>
		</Stack>
	);
}
