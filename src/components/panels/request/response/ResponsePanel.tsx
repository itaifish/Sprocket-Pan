import { Typography, Card, Divider, Stack } from '@mui/joy';

import { EndpointRequest, HistoricalEndpointResponse } from '../../../../types/application-data/application-data';
import { useAppDispatch } from '../../../../state/store';
import { HistoryControl } from './HistoryControl';
import { deleteResponseFromHistory } from '../../../../state/active/slice';
import { ResponseInfo } from './ResponseInfo';
import { ResponseState } from '../RequestActions';
import { formatFullDate } from '../../../../utils/string';
import { OpenDiffToolButton } from './OpenDiffToolButton';

function extractResponseStateData(responseState: 'latest' | number, request: EndpointRequest) {
	const responseStateIndex = responseState === 'latest' ? Math.max(request.history.length - 1, 0) : responseState;
	return responseStateIndex >= request.history.length ? null : request.history[responseStateIndex];
}

interface ResponsePanelProps {
	responseState: ResponseState;
	setResponseState: (state: ResponseState) => void;
	request: EndpointRequest;
	lastError: HistoricalEndpointResponse;
}

export function ResponsePanel({ responseState, request, setResponseState, lastError }: ResponsePanelProps) {
	const dispatch = useAppDispatch();
	const responseStateData = responseState === 'error' ? lastError : extractResponseStateData(responseState, request);
	return (
		<Card sx={{ height: '100%', width: '100%' }}>
			<Typography level="h3" sx={{ textAlign: 'center' }}>
				Response
			</Typography>
			<Divider />
			{responseStateData == null ? (
				<Stack justifyContent="center" alignItems="center" height="100%" width="100%">
					<Typography level="title-md">No Response Data Available</Typography>
					<Typography>Make a request to see the response here!</Typography>
				</Stack>
			) : (
				<>
					<Stack direction="row" justifyContent="space-between" alignItems="center">
						<Typography level="title-md" textAlign={'center'}>
							{formatFullDate(new Date(responseStateData?.response.dateTime))}
						</Typography>
						<Stack direction={'row'} spacing={0}>
							<OpenDiffToolButton
								historyIndex={
									typeof responseState === 'number' ? responseState : Math.max(request.history.length - 1, 0)
								}
								request={request}
							/>
							<HistoryControl
								value={responseState}
								onChange={setResponseState}
								historyLength={request.history.length}
								onDelete={(index) =>
									dispatch(deleteResponseFromHistory({ requestId: request.id, historyIndex: index }))
								}
							/>
						</Stack>
					</Stack>
					<Divider />
					<ResponseInfo response={responseStateData} requestId={request.id} />
				</>
			)}
		</Card>
	);
}
