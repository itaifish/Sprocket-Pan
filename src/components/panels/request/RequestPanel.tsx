import { Grid, Typography, Stack, IconButton, Card, Divider } from '@mui/joy';
import { EndpointRequest, HistoricalEndpointResponse } from '../../../types/application-data/application-data';
import { useState } from 'react';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import { clamp } from '../../../utils/math';
import { useSelector } from 'react-redux';
import { selectEndpoints, selectRequests, selectServices } from '../../../state/active/selectors';
import { useAppDispatch } from '../../../state/store';
import { deleteResponseFromHistory, updateRequest } from '../../../state/active/slice';
import DeleteForever from '@mui/icons-material/DeleteForever';
import { PanelProps } from '../panels.interface';
import { EditableText } from '../../shared/input/EditableText';
import { SprocketTooltip } from '../../shared/SprocketTooltip';
import { RequestEditTabs } from './RequestEditTabs';
import { ResponseInfo } from './response/ResponseInfo';
import { RequestActions, ResponseState } from './RequestActions';
import { defaultResponse } from './constants';

export function RequestPanel({ id }: PanelProps) {
	const requests = useSelector(selectRequests);
	const endpoints = useSelector(selectEndpoints);
	const services = useSelector(selectServices);
	const requestData = requests[id];
	const endpointData = endpoints[requestData?.endpointId];
	const serviceData = services[endpointData?.serviceId];

	const [responseState, setResponseState] = useState<ResponseState>('latest');
	const [lastError, setLastError] = useState(defaultResponse);

	const dispatch = useAppDispatch();

	if (requestData == null || endpointData == null || serviceData == null) {
		return <>Request data not found</>;
	}

	let responseStateData: HistoricalEndpointResponse;

	if (responseState != 'error') {
		const responseStateIndex = responseState === 'latest' ? Math.max(requestData.history.length - 1, 0) : responseState;
		responseStateData =
			responseStateIndex >= requestData.history.length ? defaultResponse : requestData.history[responseStateIndex];
	} else {
		responseStateData = lastError;
	}

	function update(values: Partial<EndpointRequest>) {
		dispatch(updateRequest({ ...values, id: requestData.id }));
	}

	return (
		<>
			<EditableText
				text={requestData.name}
				setText={(newText: string) => update({ name: newText })}
				isValidFunc={(text: string) => text.length >= 1}
				isTitle
			/>
			<RequestActions
				endpoint={endpointData}
				request={requestData}
				onError={setLastError}
				onResponse={setResponseState}
			/>
			<Grid container direction={'row'} spacing={1} sx={{ height: '100%' }}>
				<Grid xs={6}>
					<Card>
						<Typography level="h3" sx={{ textAlign: 'center' }}>
							Request
						</Typography>
						<Divider />
						<RequestEditTabs request={requestData} />
					</Card>
				</Grid>
				<Grid xs={6}>
					<Card>
						<Typography level="h3" sx={{ textAlign: 'center' }}>
							Response
						</Typography>
						<Divider />
						<Stack direction={'row'}>
							<SprocketTooltip text={'Previous Response'}>
								<IconButton
									aria-label="previousHistory"
									disabled={responseState === 0 || requestData.history.length === 0}
									onClick={() => {
										setResponseState((currentResponse) => {
											let newResponse: number;
											if (currentResponse === 0) {
												newResponse = currentResponse;
											} else if (currentResponse === 'error') {
												newResponse = requestData.history.length - 1;
											} else if (currentResponse === 'latest') {
												newResponse = requestData.history.length - 2;
											} else {
												newResponse = currentResponse - 1;
											}
											return clamp(newResponse, 0, Math.max(requestData.history.length - 1, 0));
										});
									}}
								>
									<ArrowLeftIcon />
								</IconButton>
							</SprocketTooltip>
							<Typography sx={{ display: 'flex', alignItems: 'center' }}>
								<EditableText
									sx={{ display: 'flex', alignItems: 'center' }}
									text={
										responseState === 'latest'
											? `${requestData.history.length}/${requestData.history.length}`
											: responseState === 'error'
											? `error`
											: `${responseState + 1}/${requestData.history.length}`
									}
									setText={(text: string) => {
										const num = Number.parseInt(text);
										setResponseState(num - 1);
									}}
									isValidFunc={(text: string) => {
										const num = Number.parseInt(text);
										return !isNaN(num) && num >= 1 && num <= requestData.history.length;
									}}
								/>
							</Typography>
							<SprocketTooltip text={'Next Response'}>
								<IconButton
									aria-label="nextHistory"
									disabled={
										responseState === 'latest' ||
										responseState == 'error' ||
										responseState >= requestData.history.length - 1
									}
									onClick={() => {
										setResponseState((currentResponse) => {
											if (currentResponse == 'error') {
												return currentResponse;
											}
											if (currentResponse === 'latest' || currentResponse === requestData.history.length - 1) {
												return currentResponse;
											} else {
												return currentResponse + 1;
											}
										});
									}}
								>
									<ArrowRightIcon />
								</IconButton>
							</SprocketTooltip>
							<SprocketTooltip text={'Delete Response'}>
								<IconButton
									disabled={responseState == 'error' || requestData.history.length == 0}
									onClick={() => {
										if (responseState == 'error') {
											return;
										}
										const index = responseState == 'latest' ? requestData.history.length - 1 : responseState;
										dispatch(deleteResponseFromHistory({ requestId: id, historyIndex: index }));
										if (responseState != 'latest' && requestData.history.length <= responseState) {
											setResponseState('latest');
										}
									}}
								>
									<DeleteForever />
								</IconButton>
							</SprocketTooltip>
						</Stack>
						<ResponseInfo response={responseStateData} requestId={id} />
					</Card>
				</Grid>
			</Grid>
		</>
	);
}
