import { useEffect, useState } from 'react';
import { Endpoint, EndpointRequest, Service } from '../../../../types/application-data/application-data';
import { useSelector } from 'react-redux';
import { selectEndpoints, selectRequests, selectServices } from '../../../../state/active/selectors';
import { SearchableRequestDropdown } from './SearchableRequestDropdown';
import { FormControl, FormLabel, Stack, Typography } from '@mui/joy';
import { HistoryControl, responseStateToNumber } from '../../../panels/request/response/HistoryControl';
import { ResponseState } from '../../../panels/request/RequestActions';
import { formatShortFullDate } from '../../../../utils/string';
import { BREAK_ALL_TEXT } from '../../../../styles/text';
import { SxProps } from '@mui/joy/styles/types';

export type SelectedResponse = { request: EndpointRequest; index: number };

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

	const [selectedHistoryIndex, setSelectedHistoryIndex] = useState<number>(0);
	const [selectedRequest, setSelectedResponse] = useState<EndpointRequest | null>(null);
	const [selectedEndpoint, setSelectedEndpoint] = useState<Endpoint | null>(null);
	const [selectedService, setSelectedService] = useState<Service | null>(null);

	const selectableServices = Object.values(services);
	const selectableEndpoints = selectedService?.endpointIds.map((endpointId) => endpoints[endpointId]) ?? [];
	const selectableRequests = selectedEndpoint?.requestIds.map((requestId) => requests[requestId]) ?? [];

	const setRequest = (value: string | null, stateIndex: ResponseState = 'latest') => {
		const request = value == null ? null : requests[value];
		const index = responseStateToNumber(stateIndex, request?.history.length);
		setSelectedResponse(request);
		setSelectedHistoryIndex(index);
		onChange(request == null ? null : { request, index });
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
		const request = initialValue.request;
		const endpoint = endpoints[request?.endpointId];
		const service = services[endpoint?.serviceId];
		setSelectedHistoryIndex(initialValue.index);
		setSelectedResponse(request);
		setSelectedEndpoint(endpoint);
		setSelectedService(service);
	}, []);

	const historyDate = selectedRequest?.history[selectedHistoryIndex]?.request.dateTime;

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
						historyLength={selectedRequest?.history.length ?? 0}
						onChange={(state) => setRequest(selectedRequest?.id ?? null, state)}
					/>
					{historyDate != null && formatShortFullDate(historyDate)}
				</Stack>
			</FormControl>
		</Stack>
	);
}
