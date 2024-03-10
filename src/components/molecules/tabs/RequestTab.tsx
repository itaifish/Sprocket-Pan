import {
	Grid,
	Select,
	Option,
	Typography,
	Button,
	Stack,
	IconButton,
	useTheme,
	useColorScheme,
	Card,
	Divider,
	CircularProgress,
	Switch,
	Tooltip,
} from '@mui/joy';
import {
	EMPTY_HEADERS,
	Endpoint,
	EndpointRequest,
	HistoricalEndpointResponse,
	RESTfulRequestVerbs,
} from '../../../types/application-data/application-data';
import { useContext, useState } from 'react';
import LabelIcon from '@mui/icons-material/Label';
import EditIcon from '@mui/icons-material/Edit';
import ParticleEffectButton from 'react-particle-effect-button';
import { rgbToHex } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { environmentContextResolver } from '../../../managers/EnvironmentContextResolver';
import { EditableText } from '../../atoms/EditableText';
import { networkRequestManager } from '../../../managers/NetworkRequestManager';
import { verbColors } from '../../../utils/style';
import { RequestEditTabs } from './request/RequestEditTabs';
import { queryParamsToString } from '../../../utils/application';
import { tabsManager } from '../../../managers/TabsManager';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import { TabsContext } from '../../../managers/GlobalContextManager';
import { TabProps } from './tab-props';
import { SprocketTooltip } from '../../atoms/SprocketTooltip';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import { clamp } from '../../../utils/math';
import { ResponseInfo } from './request/response/ResponseInfo';
import { useSelector } from 'react-redux';
import { selectActiveState, selectEndpoints, selectRequests, selectServices } from '../../../state/active/selectors';
import { useAppDispatch } from '../../../state/store';
import { updateEndpoint, updateRequest } from '../../../state/active/slice';

const defaultResponse: HistoricalEndpointResponse = {
	response: {
		statusCode: 200,
		body: 'View the response here',
		bodyType: 'Text',
		headers: structuredClone(EMPTY_HEADERS),
		dateTime: new Date(),
	},
	request: {
		method: 'GET',
		url: '',
		headers: structuredClone(EMPTY_HEADERS),
		body: {},
		dateTime: new Date(),
	},
};

const getError = (error: string): HistoricalEndpointResponse => {
	const errorRes = structuredClone(defaultResponse);
	errorRes.response.statusCode = 400;
	errorRes.response.body = error;
	errorRes.response.bodyType = 'JSON';
	return errorRes;
};

export function RequestTab({ id }: TabProps) {
	const data = useSelector(selectActiveState);
	const requestData = useSelector(selectRequests)[id];
	const endpointData = useSelector(selectEndpoints)[requestData?.endpointId];
	const serviceData = useSelector(selectServices)[endpointData?.serviceId];
	const theme = useTheme();
	const tabsContext = useContext(TabsContext);
	const { mode } = useColorScheme();
	const [hidden, setHidden] = useState(false);
	const color = theme.palette.primary[mode === 'light' ? 'lightChannel' : 'darkChannel'];
	const colorRgb = `rgb(${color.replaceAll(' ', ', ')})`;
	const hexColor = rgbToHex(colorRgb);
	const [isAnimating, setIsAnimating] = useState(false);
	const [response, setResponse] = useState<number | 'latest' | 'error'>('latest');
	const [lastError, setLastError] = useState(defaultResponse);
	const [isLoading, setLoading] = useState(false);
	const [copied, setCopied] = useState(false);
	const dispatch = useAppDispatch();

	if (requestData == null || endpointData == null || serviceData == null) {
		return <>Request data not found</>;
	}

	const isDefault = endpointData.defaultRequest === requestData.id;

	let responseData: HistoricalEndpointResponse;

	if (response != 'error') {
		const responseIndex = response === 'latest' ? Math.max(requestData.history.length - 1, 0) : response;
		responseData = responseIndex >= requestData.history.length ? defaultResponse : requestData.history[responseIndex];
	} else {
		responseData = lastError;
	}

	const fullQueryParams = { ...endpointData.baseQueryParams, ...requestData.queryParams };

	let queryStr = queryParamsToString(fullQueryParams);
	if (queryStr) {
		queryStr = `?${queryStr}`;
	}

	function update(values: Partial<EndpointRequest>) {
		dispatch(updateRequest({ ...values, id: requestData.id }));
	}

	function updateAssociatedEndpoint(values: Partial<Endpoint>) {
		dispatch(updateEndpoint({ ...values, id: requestData.endpointId }));
	}

	return (
		<>
			<EditableText
				text={requestData.name}
				setText={(newText: string) => update({ name: newText })}
				isValidFunc={(text: string) => text.length >= 1}
				isTitle
			/>
			<Grid container spacing={2} sx={{ paddingTop: '30px' }} alignItems="center" justifyContent={'center'}>
				<Grid xs={2}>
					<Select
						value={endpointData.verb}
						startDecorator={<LabelIcon />}
						color={verbColors[endpointData.verb]}
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
						{environmentContextResolver.stringWithVarsToTypography(
							`${serviceData.baseUrl}${endpointData.url}${queryStr}`,
							data,
							serviceData.id,
							requestData.id,
						)}
					</Card>
				</Grid>
				<Grid xs={5} xl={3}>
					<Stack direction={'row'} spacing={2}>
						<Button
							color="primary"
							startDecorator={isLoading ? <CircularProgress /> : <SendIcon />}
							onClick={async () => {
								if (!isLoading) {
									setLoading(true);
									const result = await networkRequestManager.sendRequest(requestData.id);
									if (result) {
										setLastError(getError(result));
										setResponse('error');
									} else {
										setResponse('latest');
									}
									setLoading(false);
								}
							}}
						>
							Send
						</Button>
						<ParticleEffectButton
							hidden={hidden}
							canvasPadding={50}
							type={'rectangle'}
							color={hexColor}
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
								if (hidden == true) {
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
										tabsManager.selectTab(tabsContext, requestData.endpointId, 'endpoint');
									}}
								>
									<EditIcon />
								</IconButton>
							</SprocketTooltip>
						</ParticleEffectButton>
						<Tooltip title="✓ Copied to clipboard!" arrow open={copied} placement="right" color="primary">
							<SprocketTooltip text={copied ? '' : 'Copy Request ID'}>
								<IconButton
									variant="outlined"
									color="primary"
									disabled={copied}
									onClick={() => {
										setCopied(true);
										setTimeout(() => {
											setCopied(false);
										}, 800);
										navigator.clipboard.writeText(requestData.id);
									}}
								>
									<FingerprintIcon />
								</IconButton>
							</SprocketTooltip>
						</Tooltip>
						<Switch
							checked={isDefault}
							onChange={(_event: React.ChangeEvent<HTMLInputElement>) =>
								updateAssociatedEndpoint({
									defaultRequest: isDefault ? null : requestData.id,
								})
							}
							endDecorator={'Default'}
						/>
					</Stack>
				</Grid>
			</Grid>
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
							<IconButton
								aria-label="previousHistory"
								disabled={response === 0 || response == 'error' || requestData.history.length === 0}
								onClick={() => {
									setResponse((currentResponse) => {
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
							<Typography sx={{ display: 'flex', alignItems: 'center' }}>
								<EditableText
									sx={{ display: 'flex', alignItems: 'center' }}
									text={
										response === 'latest' || response === 'error' ? `${requestData.history.length}` : `${response + 1}`
									}
									setText={(text: string) => {
										const num = Number.parseInt(text);
										setResponse(num - 1);
									}}
									isValidFunc={(text: string) => {
										const num = Number.parseInt(text);
										return !isNaN(num) && num >= 1 && num <= requestData.history.length;
									}}
								/>
								/{requestData.history.length}
							</Typography>
							<IconButton
								aria-label="nextHistory"
								disabled={response === 'latest' || response == 'error' || response >= requestData.history.length - 1}
								onClick={() => {
									setResponse((currentResponse) => {
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
						</Stack>
						<ResponseInfo response={responseData} requestId={id} />
					</Card>
				</Grid>
			</Grid>
		</>
	);
}
