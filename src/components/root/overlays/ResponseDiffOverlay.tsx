import { useSelector } from 'react-redux';
import { selectEndpoints, selectRequests, selectServices } from '../../../state/active/selectors';
import {
	Autocomplete,
	Box,
	Divider,
	FormControl,
	FormLabel,
	Sheet,
	Stack,
	Tab,
	TabList,
	TabPanel,
	Tabs,
	Typography,
} from '@mui/joy';
import { useState } from 'react';
import { iconFromTabType } from '../../../types/application-data/application-data';
import { HistoryControl } from '../../panels/request/response/HistoryControl';
import { SprocketEditor } from '../../shared/input/SprocketEditor';
import { VisualEventLog } from '../../panels/request/response/VisualEventLog';

function headersToJson(headers: Record<string, string>) {
	return JSON.stringify(
		Object.entries(headers)
			.sort((e1, e2) => e1[0].localeCompare(e2[0]))
			.reduce(
				(acc, curr) => {
					acc[curr[0]] = curr[1];
					return acc;
				},
				{} as Record<string, string>,
			),
	);
}

function requestHeadersToJson(headers: Record<string, string>) {
	return headersToJson(
		Object.entries(headers).reduce(
			(acc, curr) => {
				if (!curr[0].startsWith('__')) {
					acc[curr[0]] = curr[1];
				}
				return acc;
			},
			{} as Record<string, string>,
		),
	);
}

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
	const [selectedTab, setSelectedTab] = useState(0);
	const originalHistory = selectedRequest.left?.history;
	const modifiedHistory = selectedRequest.right?.history;

	const original =
		originalHistory?.length > selectedHistoryIndex.left ? originalHistory[selectedHistoryIndex.left] : null;
	const modified =
		modifiedHistory?.length > selectedHistoryIndex.right ? modifiedHistory[selectedHistoryIndex.right] : null;

	return (
		<Sheet sx={{ overflowY: 'scroll' }}>
			<Typography sx={{ textAlign: 'center', mt: '20px' }} level="h3">
				Compare Responses
			</Typography>
			<Divider />
			<Stack>
				<Stack direction={'row'} spacing={2} sx={{ mt: '20px' }} justifyContent={'space-between'}>
					{(['left', 'right'] as const).map((direction) => (
						<Box key={direction}>
							<Stack direction={'column'}>
								<FormControl>
									<FormLabel>Service</FormLabel>
									<Autocomplete
										startDecorator={iconFromTabType.service}
										autoHighlight
										value={{
											label: selectedService[direction]?.name ?? 'No Service Selected',
											value: selectedService[direction]?.id,
										}}
										onChange={(_event, newValue) => {
											if (newValue != null) {
												setSelectedService((selectedService) => ({
													...selectedService,
													[direction]: services[newValue.value],
												}));
												setSelectedEndpoint((selectedEndpoint) => ({ ...selectedEndpoint, [direction]: null }));
												setSelectedRequest((selectedRequest) => ({ ...selectedRequest, [direction]: null }));
												setSelectedHistoryIndex((selectedHistoryIndex) => ({
													...selectedHistoryIndex,
													[direction]: 0,
												}));
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
										value={{
											label: selectedEndpoint[direction]?.name ?? 'No Endpoint Selected',
											value: selectedEndpoint[direction]?.id,
										}}
										onChange={(_event, newValue) => {
											if (newValue != null) {
												setSelectedEndpoint((selectedEndpoint) => ({
													...selectedEndpoint,
													[direction]: endpoints[newValue.value],
												}));
												setSelectedRequest((selectedRequest) => ({ ...selectedRequest, [direction]: null }));
												setSelectedHistoryIndex((selectedHistoryIndex) => ({
													...selectedHistoryIndex,
													[direction]: 0,
												}));
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
										value={{
											label: selectedRequest[direction]?.name ?? 'No Request Selected',
											value: selectedRequest[direction]?.id,
										}}
										onChange={(_event, newValue) => {
											if (newValue != null) {
												setSelectedRequest((selectedRequest) => ({
													...selectedRequest,
													[direction]: requests[newValue.value],
												}));
												setSelectedHistoryIndex((selectedHistoryIndex) => ({
													...selectedHistoryIndex,
													[direction]: 0,
												}));
											}
										}}
										options={Object.values(requests).map((service) => ({ label: service.name, value: service.id }))}
									></Autocomplete>
								</FormControl>
								<FormControl>
									<FormLabel>History Item</FormLabel>
									<HistoryControl
										value={selectedHistoryIndex[direction] ?? 0}
										historyLength={selectedRequest[direction]?.history.length ?? 0}
										onChange={(state) =>
											setSelectedHistoryIndex((selectedHistoryIndex) => ({
												...selectedHistoryIndex,
												[direction]: state,
											}))
										}
									/>
								</FormControl>
							</Stack>
						</Box>
					))}
				</Stack>
				{original && modified && (
					<Sheet sx={{ width: '80vw' }}>
						<Tabs value={selectedTab} onChange={(_e, newTab) => setSelectedTab(newTab as number)}>
							<TabList color="primary">
								{['Response Body', 'Response Headers', 'Request Headers', 'Request Body', 'Event Log'].map(
									(text, index) => (
										<Tab color={selectedTab === index ? 'primary' : 'neutral'} value={index} key={index}>
											{text}
										</Tab>
									),
								)}
							</TabList>
							<TabPanel value={0}>
								<>
									<Typography sx={{ textAlign: 'center', mt: '20px' }} level="h4">
										Response Body
									</Typography>
									<SprocketEditor
										width={'100%'}
										height={'40vh'}
										isDiff={true}
										original={original.response.body}
										modified={modified.response.body}
										originalLanguage={original.response.bodyType?.toLocaleLowerCase()}
										modifiedLanguage={modified.response.bodyType?.toLocaleLowerCase()}
										options={{ readOnly: true, domReadOnly: true, originalEditable: false }}
									/>
								</>
							</TabPanel>
							<TabPanel value={1}>
								<>
									<Typography sx={{ textAlign: 'center', mt: '20px' }} level="h4">
										Response Headers
									</Typography>
									<SprocketEditor
										width={'100%'}
										height={'40vh'}
										isDiff={true}
										original={headersToJson(original.response.headers)}
										modified={headersToJson(modified.response.headers)}
										language="json"
										options={{ readOnly: true, domReadOnly: true, originalEditable: false }}
									/>
								</>
							</TabPanel>
							<TabPanel value={2}>
								<>
									<Typography sx={{ textAlign: 'center', mt: '20px' }} level="h4">
										Request Headers
									</Typography>
									<SprocketEditor
										width={'100%'}
										height={'40vh'}
										isDiff={true}
										original={requestHeadersToJson(original.request.headers)}
										modified={requestHeadersToJson(modified.request.headers)}
										language="json"
										options={{ readOnly: true, domReadOnly: true, originalEditable: false }}
									/>
								</>
							</TabPanel>
							<TabPanel value={3}>
								<>
									<Typography sx={{ textAlign: 'center', mt: '20px' }} level="h4">
										Request Body
									</Typography>
									<SprocketEditor
										width={'100%'}
										height={'40vh'}
										isDiff={true}
										// TODO: Remove this once we add the backwards compatibility logic
										original={
											typeof original.request.body === 'string'
												? original.request.body
												: JSON.stringify(original.request.body)
										}
										modified={
											typeof modified.request.body === 'string'
												? modified.request.body
												: JSON.stringify(modified.request.body)
										}
										originalLanguage={original.request.bodyType?.toLocaleLowerCase()}
										modifiedLanguage={modified.request.bodyType?.toLocaleLowerCase()}
										options={{ readOnly: true, domReadOnly: true, originalEditable: false }}
									/>
								</>
							</TabPanel>
							<TabPanel value={4}>
								<Typography sx={{ textAlign: 'center', mt: '20px' }} level="h4">
									Event Log
								</Typography>
								<Stack direction={'row'} justifyContent={'space-between'}>
									<VisualEventLog auditLog={original.auditLog ?? []} requestId={selectedRequest.left.id} />
									<VisualEventLog auditLog={modified.auditLog ?? []} requestId={selectedRequest.right.id} />
								</Stack>
							</TabPanel>
						</Tabs>
					</Sheet>
				)}
			</Stack>
		</Sheet>
	);
}
