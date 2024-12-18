import { Typography, Divider, Stack } from '@mui/joy';
import { HistoryControl, responseStateToNumber } from './HistoryControl';
import { ResponseInfo } from './ResponseInfo';
import { ResponseState } from '../RequestActions';
import { OpenDiffToolButton } from './OpenDiffToolButton';
import { activeActions } from '@/state/active/slice';
import { useAppDispatch } from '@/state/store';
import { EndpointRequest, HistoricalEndpointResponse } from '@/types/data/workspace';
import { formatFullDate } from '@/utils/string';
import { useSelector } from 'react-redux';
import { selectHistoryById } from '@/state/active/selectors';

function extractResponseStateData(responseState: 'latest' | number, history: HistoricalEndpointResponse[]) {
	const responseStateIndex = responseState === 'latest' ? Math.max(history.length - 1, 0) : responseState;
	return responseStateIndex >= history.length ? null : history[responseStateIndex];
}

interface ResponsePanelProps {
	responseState: ResponseState;
	setResponseState: (state: ResponseState) => void;
	request: EndpointRequest;
	lastError: HistoricalEndpointResponse;
}

export function ResponsePanel({ responseState, request, setResponseState, lastError }: ResponsePanelProps) {
	const dispatch = useAppDispatch();
	const history = useSelector((state) => selectHistoryById(state, request.id));
	const responseStateData = responseState === 'error' ? lastError : extractResponseStateData(responseState, history);

	if (responseStateData == null) {
		return (
			<Stack justifyContent="center" alignItems="center" height="100%" width="100%">
				<Typography level="title-md">No Response Data Available</Typography>
				<Typography>Make a request to see the response here!</Typography>
			</Stack>
		);
	}
	return (
		<>
			<Stack direction="row" justifyContent="space-between" alignItems="center">
				<Typography level="title-md" textAlign="center">
					{formatFullDate(new Date(responseStateData?.response.dateTime))}
				</Typography>
				<Stack direction="row" spacing={0}>
					<OpenDiffToolButton historyIndex={responseStateToNumber(responseState, history.length)} id={request.id} />
					<HistoryControl
						value={responseState}
						onChange={setResponseState}
						historyLength={history.length}
						onDelete={(index) =>
							dispatch(activeActions.deleteResponseFromHistory({ requestId: request.id, historyIndex: index }))
						}
					/>
				</Stack>
			</Stack>
			<Divider />
			<ResponseInfo response={responseStateData} requestId={request.id} />
		</>
	);
}
