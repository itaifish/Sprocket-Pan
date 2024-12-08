import { Button, Stack, CircularProgress, Select, Option, Card } from '@mui/joy';
import LabelIcon from '@mui/icons-material/Label';
import {
	Endpoint,
	EndpointRequest,
	HistoricalEndpointResponse,
	RESTfulRequestVerbs,
} from '../../../types/application-data/application-data';
import { useState } from 'react';
import SendIcon from '@mui/icons-material/Send';
import { useAppDispatch } from '../../../state/store';
import { makeRequest } from '../../../state/active/thunks/requests';
import { log } from '../../../utils/logging';
import { SprocketError } from '../../../types/state/state';
import { defaultResponse } from './constants';
import { useSelector } from 'react-redux';
import { selectEnvironmentSnippets } from '../../../state/active/selectors';
import { EnvironmentTypography } from '../../shared/EnvironmentTypography';
import { verbColors } from '../../../constants/style';

const getError = (error: SprocketError): HistoricalEndpointResponse => {
	const errorRes = structuredClone(defaultResponse);
	errorRes.response.statusCode = 400;
	errorRes.response.body = JSON.stringify({ error });
	errorRes.response.bodyType = 'JSON';
	return errorRes;
};

export type ResponseState = number | 'latest' | 'error';

interface RequestActionsProps {
	endpoint: Endpoint;
	request: EndpointRequest;
	onError: (err: HistoricalEndpointResponse) => void;
	onResponse: (res: ResponseState) => void;
	activateEditButton: () => void;
}

export function RequestActions({ endpoint, request, onError, onResponse, activateEditButton }: RequestActionsProps) {
	const envSnippets = useSelector((state) => selectEnvironmentSnippets(state, request.id));
	const dispatch = useAppDispatch();
	const [isLoading, setLoading] = useState(false);

	async function sendRequest() {
		if (isLoading) {
			return;
		}
		setLoading(true);
		try {
			const result = await dispatch(makeRequest({ requestId: request.id })).unwrap();
			if (result != undefined) {
				onError(getError(result));
				onResponse('error');
			} else {
				onResponse('latest');
			}
		} catch (err) {
			onError(getError((err as any)?.message ?? 'An unknown error occured'));
			log.error(err);
			onResponse('error');
		}
		setLoading(false);
	}

	return (
		<Stack direction="row" gap={2}>
			<Select
				sx={{ minWidth: 150 }}
				value={endpoint.verb}
				startDecorator={<LabelIcon />}
				color={verbColors[endpoint.verb]}
				variant="soft"
				listboxOpen={false}
				onListboxOpenChange={activateEditButton}
			>
				{RESTfulRequestVerbs.map((verb, index) => (
					<Option key={index} value={verb} color={verbColors[verb]}>
						{verb}
					</Option>
				))}
			</Select>

			<Card
				variant="outlined"
				color={'primary'}
				onClick={activateEditButton}
				sx={{
					'--Card-padding': '6px',
					overflowWrap: 'anywhere',
					wordBreak: 'break-all',
					flexGrow: 1,
				}}
			>
				<EnvironmentTypography snippets={envSnippets} />
			</Card>

			<Button
				color={isLoading ? 'warning' : 'primary'}
				startDecorator={isLoading ? <CircularProgress /> : <SendIcon />}
				onClick={sendRequest}
				sx={{ minWidth: 150 }}
			>
				Send{isLoading ? 'ing' : ''}
			</Button>
		</Stack>
	);
}
