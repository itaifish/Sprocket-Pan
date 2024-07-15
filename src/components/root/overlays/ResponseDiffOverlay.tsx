import { useSelector } from 'react-redux';
import { selectEndpoints, selectRequests, selectServices } from '../../../state/active/selectors';
import { Autocomplete, Box, Divider, FormControl, FormLabel, Sheet, Stack, Typography } from '@mui/joy';
import { useState } from 'react';
import { iconFromTabType } from '../../../types/application-data/application-data';
import { HistoryControl } from '../../panels/request/response/HistoryControl';

export type SelectedResponseDiffItem = {
	requestId: string;
	historyIndex: number;
};
export type ResponseDiffSelection = { left: SelectedResponseDiffItem; right: SelectedResponseDiffItem };

interface ResponseDiffOverlayProps {
	initialSelection: ResponseDiffSelection;
}

export function ResponseDiffOverlay({ initialSelection }: ResponseDiffOverlayProps) {
	const services = useSelector(selectServices);
	const endpoints = useSelector(selectEndpoints);
	const requests = useSelector(selectRequests);

	const initialRequest = {
		left: requests[initialSelection.left.requestId],
		right: requests[initialSelection.right.requestId],
	};

	const initialEndpoint = {
		left: endpoints[initialRequest.left.endpointId],
		right: endpoints[initialRequest.right.endpointId],
	};

	const initialService = {
		left: services[initialEndpoint.left.serviceId],
		right: services[initialEndpoint.right.serviceId],
	};

	const [selectedHistoryIndex, setSelectedHistoryIndex] = useState({
		left: initialSelection.left.historyIndex,
		right: initialSelection.right.historyIndex,
	});
	const [selectedRequest, setSelectedRequest] = useState(initialRequest);
	const [selectedEndpoint, setSelectedEndpoint] = useState(initialEndpoint);
	const [selectedService, setSelectedService] = useState(initialService);

	return (
		<Sheet>
			<Typography sx={{ textAlign: 'center' }} level="h2">
				Compare Responses
			</Typography>
			<Divider />
			<Stack direction={'row'} spacing={2}>
				{(['left', 'right'] as const).map((direction) => (
					<Box key={direction}>
						<Stack direction={'column'}>
							<FormControl>
								<FormLabel>Service</FormLabel>
								<Autocomplete
									startDecorator={iconFromTabType.service}
									autoHighlight
									value={{ label: selectedService[direction].name, value: selectedService[direction].id }}
									onChange={(_event, newValue) => {
										if (newValue != null) {
											setSelectedService((selectedService) => ({
												...selectedService,
												[direction]: services[newValue.value],
											}));
											setSelectedEndpoint((selectedEndpoint) => ({ ...selectedEndpoint, [direction]: null }));
											setSelectedRequest((selectedRequest) => ({ ...selectedRequest, [direction]: null }));
											setSelectedHistoryIndex((selectedHistoryIndex) => ({ ...selectedHistoryIndex, [direction]: 0 }));
										}
									}}
									options={Object.values(services).map((service) => ({ label: service.name, value: service.id }))}
								></Autocomplete>
							</FormControl>
							<FormControl>
								<FormLabel>Endpoint</FormLabel>
								<Autocomplete
									startDecorator={iconFromTabType.endpoint}
									autoHighlight
									value={{ label: selectedEndpoint[direction].name, value: selectedEndpoint[direction].id }}
									onChange={(_event, newValue) => {
										if (newValue != null) {
											setSelectedEndpoint((selectedEndpoint) => ({
												...selectedEndpoint,
												[direction]: endpoints[newValue.value],
											}));
											setSelectedRequest((selectedRequest) => ({ ...selectedRequest, [direction]: null }));
											setSelectedHistoryIndex((selectedHistoryIndex) => ({ ...selectedHistoryIndex, [direction]: 0 }));
										}
									}}
									options={Object.values(endpoints).map((service) => ({ label: service.name, value: service.id }))}
								></Autocomplete>
							</FormControl>
							<FormControl>
								<FormLabel>Request</FormLabel>
								<Autocomplete
									startDecorator={iconFromTabType.request}
									autoHighlight
									value={{ label: selectedRequest[direction].name, value: selectedRequest[direction].id }}
									onChange={(_event, newValue) => {
										if (newValue != null) {
											setSelectedRequest((selectedRequest) => ({
												...selectedRequest,
												[direction]: requests[newValue.value],
											}));
											setSelectedHistoryIndex((selectedHistoryIndex) => ({ ...selectedHistoryIndex, [direction]: 0 }));
										}
									}}
									options={Object.values(requests).map((service) => ({ label: service.name, value: service.id }))}
								></Autocomplete>
							</FormControl>
							<FormControl>
								<FormLabel>History Item</FormLabel>
								<HistoryControl
									value={selectedHistoryIndex[direction]}
									historyLength={selectedRequest[direction].history.length}
									onChange={(state) =>
										setSelectedHistoryIndex((selectedHistoryIndex) => ({ ...selectedHistoryIndex, [direction]: state }))
									}
								/>
							</FormControl>
						</Stack>
					</Box>
				))}
			</Stack>
		</Sheet>
	);
}
