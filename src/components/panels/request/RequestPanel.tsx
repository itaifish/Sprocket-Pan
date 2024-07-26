import { Grid, Typography, Card, Divider } from '@mui/joy';
import { EndpointRequest } from '../../../types/application-data/application-data';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectFullRequestInfoById } from '../../../state/active/selectors';
import { useAppDispatch } from '../../../state/store';
import { updateRequest } from '../../../state/active/slice';
import { PanelProps } from '../panels.interface';
import { EditableText } from '../../shared/input/EditableText';
import { RequestEditTabs } from './RequestEditTabs';
import { RequestActions, ResponseState } from './RequestActions';
import { defaultResponse } from './constants';
import { ResponsePanel } from './response/ResponsePanel';

export function RequestPanel({ id }: PanelProps) {
	const { request, endpoint, service } = useSelector((state) => selectFullRequestInfoById(state, id));

	const [responseState, setResponseState] = useState<ResponseState>('latest');
	const [lastError, setLastError] = useState(defaultResponse);

	const dispatch = useAppDispatch();

	if (request == null || endpoint == null || service == null) {
		return <>Request data not found</>;
	}

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
					<Card sx={{ height: '100%', width: '100%' }}>
						<Typography level="h3" sx={{ textAlign: 'center' }}>
							Request
						</Typography>
						<Divider />
						<RequestEditTabs request={request} />
					</Card>
				</Grid>
				<Grid xs={6}>
					<ResponsePanel
						responseState={responseState}
						setResponseState={setResponseState}
						lastError={lastError}
						request={request}
					/>
				</Grid>
			</Grid>
		</>
	);
}
