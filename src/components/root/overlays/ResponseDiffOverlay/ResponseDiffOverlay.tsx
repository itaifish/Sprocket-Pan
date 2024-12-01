import { useSelector } from 'react-redux';
import { selectEndpoints, selectRequests, selectServices } from '../../../../state/active/selectors';
import {
	Box,
	Chip,
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
import { HistoryControl } from '../../../panels/request/response/HistoryControl';
import { VisualEventLog } from '../../../panels/request/response/VisualEventLog';
import { formatShortFullDate } from '../../../../utils/string';
import { SearchableRequestDropdown } from './SearchableRequestDropdown';
import { statusCodes } from '../../../../constants/statusCodes';
import { verbColors } from '../../../../constants/style';
import { KeyValuePair } from '../../../../classes/OrderedKeyValuePairs';
import { toKeyValuePairs } from '../../../../utils/application';
import { DiffText } from '../../../shared/input/DiffText';

function headersToJson(headers: Record<string, string> | KeyValuePair[]) {
	const convertedHeaders = Array.isArray(headers) ? headers.slice() : toKeyValuePairs(headers);
	return JSON.stringify(
		convertedHeaders
			.sort((e1, e2) => e1.key.localeCompare(e2.key))
			.reduce(
				(acc, curr) => {
					acc[curr.key] = curr.value ?? '';
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

	const selectableEndpoints = {
		left: selectedService?.left?.endpointIds.map((endpointId) => endpoints[endpointId]) ?? [],
		right: selectedService?.right?.endpointIds.map((endpointId) => endpoints[endpointId]) ?? [],
	};

	const selectableRequests = {
		left: selectedEndpoint?.left?.requestIds.map((requestId) => requests[requestId]) ?? [],
		right: selectedEndpoint?.right?.requestIds.map((requestId) => requests[requestId]) ?? [],
	};

	return (
		<Sheet sx={{ overflowY: 'scroll', px: '20px' }}>
			<Typography sx={{ textAlign: 'center', mt: '20px' }} level="h3">
				Compare Responses
			</Typography>
			<Divider />
			<Stack>
				<Stack direction={'row'} spacing={2} sx={{ mt: '20px' }} justifyContent={'space-between'}>
					{(['left', 'right'] as const).map((direction) => (
						<Box key={direction}>
							<Stack direction={'column'}>
								<SearchableRequestDropdown
									name={'service'}
									selected={selectedService[direction]}
									onChange={(newValue) => {
										if (newValue != null) {
											setSelectedService((selectedService) => ({
												...selectedService,
												[direction]: services[newValue.value as string],
											}));
											setSelectedEndpoint((selectedEndpoint) => ({ ...selectedEndpoint, [direction]: null }));
											setSelectedRequest((selectedRequest) => ({ ...selectedRequest, [direction]: null }));
											setSelectedHistoryIndex((selectedHistoryIndex) => ({
												...selectedHistoryIndex,
												[direction]: 0,
											}));
										}
									}}
									options={Object.values(services)}
								/>
								<SearchableRequestDropdown
									name={'endpoint'}
									selected={selectedEndpoint[direction]}
									onChange={(newValue) => {
										if (newValue != null) {
											setSelectedEndpoint((selectedEndpoint) => ({
												...selectedEndpoint,
												[direction]: endpoints[newValue.value as string],
											}));
											setSelectedRequest((selectedRequest) => ({ ...selectedRequest, [direction]: null }));
											setSelectedHistoryIndex((selectedHistoryIndex) => ({
												...selectedHistoryIndex,
												[direction]: 0,
											}));
										}
									}}
									options={selectableEndpoints[direction]}
								/>
								<SearchableRequestDropdown
									name={'request'}
									selected={selectedRequest[direction]}
									onChange={(newValue) => {
										if (newValue != null) {
											setSelectedRequest((selectedRequest) => ({
												...selectedRequest,
												[direction]: requests[newValue.value as string],
											}));
											setSelectedHistoryIndex((selectedHistoryIndex) => ({
												...selectedHistoryIndex,
												[direction]: 0,
											}));
										}
									}}
									options={selectableRequests[direction]}
								/>

								<FormControl>
									<FormLabel>History Item</FormLabel>
									<Stack direction={'row'} alignItems={'center'}>
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
										{(selectedHistoryIndex[direction] ?? Number.MAX_SAFE_INTEGER) <
											selectedRequest[direction]?.history.length &&
											formatShortFullDate(
												selectedRequest[direction]?.history[selectedHistoryIndex[direction]]?.request.dateTime,
											)}
									</Stack>
								</FormControl>
							</Stack>
						</Box>
					))}
				</Stack>
				<Sheet sx={{ width: '80vw' }}>
					{original && modified && (
						<Tabs value={selectedTab} onChange={(_e, newTab) => setSelectedTab(newTab as number)}>
							<TabList color="primary">
								{['Response Body', 'Response Headers', 'Request Body', 'Request Headers', 'Event Log'].map(
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
									<DiffText
										original={original.response.body}
										modified={modified.response.body}
										originalLanguage={original.response.bodyType?.toLocaleLowerCase()}
										modifiedLanguage={modified.response.bodyType?.toLocaleLowerCase()}
									/>
								</>
							</TabPanel>
							<TabPanel value={1}>
								<>
									<Typography sx={{ textAlign: 'center', mt: '20px' }} level="h4">
										Response Headers
									</Typography>
									<Stack direction={'row'} justifyContent={'space-between'}>
										<Typography>
											{original.response.statusCode}: {statusCodes[original.response.statusCode]}
										</Typography>
										<Typography>
											{modified.response.statusCode}: {statusCodes[modified.response.statusCode]}
										</Typography>
									</Stack>
									<DiffText
										original={headersToJson(original.response.headers)}
										modified={headersToJson(modified.response.headers)}
									/>
								</>
							</TabPanel>
							<TabPanel value={3}>
								<>
									<Typography sx={{ textAlign: 'center', mt: '20px' }} level="h4">
										Request Headers
									</Typography>
									<DiffText
										original={headersToJson(original.request.headers)}
										modified={headersToJson(modified.request.headers)}
									/>
								</>
							</TabPanel>
							<TabPanel value={2}>
								<>
									<Typography sx={{ textAlign: 'center', mt: '20px' }} level="h4">
										Request Body
									</Typography>
									<Stack direction={'row'} justifyContent={'space-between'} textAlign={'center'}>
										<Box>
											<Stack direction={'row'} spacing={0}>
												<Chip color={verbColors[original.request.method]}>{original.request.method}</Chip>
												<Typography level="body-md">{original.request.url}</Typography>
											</Stack>
										</Box>
										<Box>
											<Stack direction={'row'} spacing={0}>
												<Chip color={verbColors[modified.request.method]}>{modified.request.method}</Chip>
												<Typography level="body-md">{modified.request.url}</Typography>
											</Stack>
										</Box>
									</Stack>
									<DiffText
										original={original.request.body}
										modified={modified.request.body}
										originalLanguage={original.request.bodyType?.toLocaleLowerCase()}
										modifiedLanguage={modified.request.bodyType?.toLocaleLowerCase()}
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
					)}
				</Sheet>
			</Stack>
		</Sheet>
	);
}
