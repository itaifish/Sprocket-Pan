import { Grid, Typography, Card, Divider } from '@mui/joy';
import { EndpointRequest } from '../../../types/application-data/application-data';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectFullRequestInfoById } from '../../../state/active/selectors';
import { useAppDispatch } from '../../../state/store';
import { deleteResponseFromHistory, updateRequest } from '../../../state/active/slice';
import { PanelProps } from '../panels.interface';
import { EditableText } from '../../shared/input/EditableText';
import { RequestEditTabs } from './RequestEditTabs';
import { ResponseInfo } from './response/ResponseInfo';
import { RequestActions, ResponseState } from './RequestActions';
import { defaultResponse } from './constants';
import { HistoryControl } from './HistoryControl';

function extractResponseStateData(responseState: 'latest' | number, request: EndpointRequest) {
	const responseStateIndex = responseState === 'latest' ? Math.max(request.history.length - 1, 0) : responseState;
	return responseStateIndex >= request.history.length ? defaultResponse : request.history[responseStateIndex];
}

export function RequestPanel({ id }: PanelProps) {
	const { request, endpoint, service } = useSelector((state) => selectFullRequestInfoById(state, id));

	const [responseState, setResponseState] = useState<ResponseState>('latest');
	const [lastError, setLastError] = useState(defaultResponse);

	const dispatch = useAppDispatch();

	if (request == null || endpoint == null || service == null) {
		return <>Request data not found</>;
	}

	const responseStateData = responseState === 'error' ? lastError : extractResponseStateData(responseState, request);

	function update(values: Partial<EndpointRequest>) {
		dispatch(updateRequest({ ...values, id: request.id }));
	}

	return (
		<>
			<EditableText
				text={request.name}
				setText={(newText: string) => update({ name: newText })}
				isValidFunc={(text: string) => text.length >= 1}
				isTitle
			/>
			<RequestActions endpoint={endpoint} request={request} onError={setLastError} onResponse={setResponseState} />
			<Grid container direction={'row'} spacing={1} sx={{ height: '100%' }}>
				<Grid xs={6}>
					<Card>
						<Typography level="h3" sx={{ textAlign: 'center' }}>
							Request
						</Typography>
						<Divider />
						<RequestEditTabs request={request} />
					</Card>
				</Grid>
				<Grid xs={6}>
					<Card>
						<Typography level="h3" sx={{ textAlign: 'center' }}>
							Response
						</Typography>
						<Divider />
						<HistoryControl
							value={responseState}
							onChange={setResponseState}
							historyLength={request.history.length}
							onDelete={(index) => dispatch(deleteResponseFromHistory({ requestId: id, historyIndex: index }))}
						/>
						<ResponseInfo response={responseStateData} requestId={id} />
					</Card>
				</Grid>
			</Grid>
		</>
	);
}
