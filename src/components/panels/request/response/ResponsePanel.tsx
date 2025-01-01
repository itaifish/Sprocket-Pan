import { Typography, Divider, Stack } from '@mui/joy';
import { HistoryControl, responseStateToNumber } from './HistoryControl';
import { ResponseInfo } from './ResponseInfo';
import { OpenDiffToolButton } from './OpenDiffToolButton';
import { activeActions } from '@/state/active/slice';
import { useAppDispatch } from '@/state/store';
import { EndpointRequest, HistoricalEndpointResponse } from '@/types/data/workspace';
import { formatFullDate } from '@/utils/string';
import { useSelector } from 'react-redux';
import { selectHistoryById } from '@/state/active/selectors';
import { ResponseState } from '../RequestActions';
import { useState } from 'react';

function extractResponseStateData(responseState: ResponseState, history: HistoricalEndpointResponse[]) {
	const responseStateIndex = typeof responseState === 'string' ? Math.max(history.length - 1, 0) : responseState;
	return responseStateIndex >= history.length ? null : history[responseStateIndex];
}

interface ResponsePanelProps {
	request: EndpointRequest;
}

export function ResponsePanel({ request }: ResponsePanelProps) {
	const dispatch = useAppDispatch();
	const [responseState, setResponseState] = useState<ResponseState>('latest');
	const history = useSelector((state) => selectHistoryById(state, request.id));
	const response = extractResponseStateData(responseState, history);

	if (response == null) {
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
					{response.response == null ? 'No Response Found' : formatFullDate(response.response.dateTime)}
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
			<ResponseInfo response={response} requestId={request.id} />
		</>
	);
}
