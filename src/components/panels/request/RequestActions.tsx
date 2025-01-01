import { Button, Stack, CircularProgress, Select, Option, Card } from '@mui/joy';
import LabelIcon from '@mui/icons-material/Label';
import { useState } from 'react';
import SendIcon from '@mui/icons-material/Send';
import { useSelector } from 'react-redux';
import { EnvironmentTypography } from '@/components/shared/EnvironmentTypography';
import { verbColors } from '@/constants/style';
import { selectEnvironmentSnippets, selectSettings } from '@/state/active/selectors';
import { RESTfulRequestVerbs } from '@/types/data/shared';
import { Endpoint, EndpointRequest } from '@/types/data/workspace';
import { networkRequestManager } from '@/managers/NetworkRequestManager';
import { useAppDispatch } from '@/state/store';
import { activeActions } from '@/state/active/slice';

interface RequestActionsProps {
	endpoint: Endpoint;
	request: EndpointRequest;
	activateEditButton: () => void;
}

export function RequestActions({ endpoint, request, activateEditButton }: RequestActionsProps) {
	const envSnippets = useSelector((state) => selectEnvironmentSnippets(state, request.id));
	const settings = useSelector(selectSettings);
	const [isLoading, setLoading] = useState(false);
	const dispatch = useAppDispatch();

	async function sendRequest() {
		if (isLoading) {
			return;
		}
		setLoading(true);
		const result = await networkRequestManager.makeRequestWithScripts(request.id);
		dispatch(
			activeActions.addResponseToHistory({
				requestId: request.id,
				...result,
				maxLength: settings.history.maxLength,
				discard: settings.history.enabled,
			}),
		);
		setLoading(false);
	}

	return (
		<Stack direction="row" gap={2} alignItems="center">
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
				color="primary"
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
