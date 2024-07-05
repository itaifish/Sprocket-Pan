import { Button, Stack, IconButton, CircularProgress, Switch, Grid, Select, Option, Card } from '@mui/joy';
import LabelIcon from '@mui/icons-material/Label';
import {
	Endpoint,
	EndpointRequest,
	HistoricalEndpointResponse,
	RESTfulRequestVerbs,
} from '../../../types/application-data/application-data';
import { useState } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import ParticleEffectButton from 'react-particle-effect-button';
import SendIcon from '@mui/icons-material/Send';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import { useAppDispatch } from '../../../state/store';
import { updateEndpoint } from '../../../state/active/slice';
import { makeRequest } from '../../../state/active/thunks/requests';
import { log } from '../../../utils/logging';
import { addTabs, setSelectedTab } from '../../../state/tabs/slice';
import { SprocketError } from '../../../types/state/state';
import { SprocketTooltip } from '../../shared/SprocketTooltip';
import { defaultResponse } from './constants';
import { useSelector } from 'react-redux';
import { selectEnvironmentTypography } from '../../../state/active/selectors';
import { verbColors } from '../../../utils/style';
import { useParticleThemeColor } from '../../../hooks/useParticleThemeColor';
import { CopyToClipboardButton } from '../../shared/buttons/CopyToClipboardButton';

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
}

export function RequestActions({ endpoint, request, onError, onResponse }: RequestActionsProps) {
	const [hidden, setHidden] = useState(false);
	const [isAnimating, setIsAnimating] = useState(false);
	const environmentTypography = useSelector((state) => selectEnvironmentTypography(state, request.id));
	const dispatch = useAppDispatch();
	const particleColor = useParticleThemeColor();
	const [isLoading, setLoading] = useState(false);
	const isDefault = endpoint.defaultRequest === request.id;
	function updateAssociatedEndpoint(values: Partial<Endpoint>) {
		dispatch(updateEndpoint({ ...values, id: request.endpointId }));
	}

	async function sendRequest() {
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
		<Grid container spacing={2} sx={{ paddingTop: '30px' }} alignItems="center" justifyContent={'center'}>
			<Grid xs={2}>
				<Select
					value={endpoint.verb}
					startDecorator={<LabelIcon />}
					color={verbColors[endpoint.verb]}
					variant="soft"
					listboxOpen={false}
					onListboxOpenChange={() => {
						if (!isAnimating) {
							setHidden(true);
						}
					}}
				>
					{RESTfulRequestVerbs.map((verb, index) => (
						<Option key={index} value={verb} color={verbColors[verb]}>
							{verb}
						</Option>
					))}
				</Select>
			</Grid>
			<Grid xs={5} xl={7}>
				<Card
					variant="outlined"
					color={'primary'}
					onClick={() => {
						if (!isAnimating) {
							setHidden(true);
						}
					}}
					sx={{
						'--Card-padding': '6px',
						overflowWrap: 'break-word',
					}}
				>
					{environmentTypography}
				</Card>
			</Grid>
			<Grid xs={5} xl={3}>
				<Stack direction={'row'} spacing={2}>
					<Button
						color="primary"
						startDecorator={isLoading ? <CircularProgress /> : <SendIcon />}
						onClick={sendRequest}
					>
						Send
					</Button>
					<ParticleEffectButton
						hidden={hidden}
						canvasPadding={50}
						type={'rectangle'}
						color={particleColor}
						oscillationCoefficient={15}
						style={'stroke'}
						particlesAmountCoefficient={2}
						duration={800}
						speed={0.7}
						direction={'top'}
						easing={'easeOutSine'}
						onBegin={() => {
							setIsAnimating(true);
						}}
						size={4}
						onComplete={() => {
							if (hidden) {
								setTimeout(() => setHidden(false), 50);
							} else {
								setIsAnimating(false);
							}
						}}
					>
						<SprocketTooltip text="Edit Endpoint">
							<IconButton
								variant="outlined"
								color="primary"
								onClick={() => {
									dispatch(addTabs({ [request.endpointId]: 'endpoint' }));
									dispatch(setSelectedTab(request.endpointId));
								}}
							>
								<EditIcon />
							</IconButton>
						</SprocketTooltip>
					</ParticleEffectButton>
					<CopyToClipboardButton tooltipText="Copy Request ID" copyText={request.id}>
						<FingerprintIcon />
					</CopyToClipboardButton>
					<Switch
						checked={isDefault}
						onChange={(_event: React.ChangeEvent<HTMLInputElement>) =>
							updateAssociatedEndpoint({
								defaultRequest: isDefault ? null : request.id,
							})
						}
						endDecorator={'Default'}
					/>
				</Stack>
			</Grid>
		</Grid>
	);
}
