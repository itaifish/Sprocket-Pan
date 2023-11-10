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
} from '@mui/joy';
import { RESTfulRequestVerbs } from '../../../types/application-data/application-data';
import { useContext, useState } from 'react';
import LabelIcon from '@mui/icons-material/Label';
import EditIcon from '@mui/icons-material/Edit';
import ParticleEffectButton from 'react-particle-effect-button';
import { rgbToHex } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { environmentContextResolver } from '../../../managers/EnvironmentContextResolver';
import { EditableText } from '../../atoms/EditableText';
import { applicationDataManager } from '../../../managers/ApplicationDataManager';
import { networkRequestManager } from '../../../managers/NetworkRequestManager';
import { ResponseBody } from './request/ResponseBody';
import { verbColors } from '../../../utils/style';
import { RequestEditTabs } from './request/RequestEditTabs';
import { queryParamsToString } from '../../../utils/application';
import { tabsManager } from '../../../managers/TabsManager';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import { ApplicationDataContext, TabsContext } from '../../../managers/GlobalContextManager';
import { TabProps } from './tab-props';

const defaultResponse = {
	responseText: 'View the response here',
	contentType: 'text',
};

export function RequestTab(props: TabProps) {
	const data = useContext(ApplicationDataContext);
	const requestData = data.requests[props.id];
	const endpointData = data.endpoints[requestData.endpointId];
	const serviceData = data.services[endpointData?.serviceId];
	const theme = useTheme();
	const tabsContext = useContext(TabsContext);
	const { mode } = useColorScheme();
	const [hidden, setHidden] = useState(false);
	const color = theme.palette.primary[mode === 'light' ? 'lightChannel' : 'darkChannel'];
	const colorRgb = `rgb(${color.replaceAll(' ', ', ')})`;
	const hexColor = rgbToHex(colorRgb);
	const [isAnimating, setIsAnimating] = useState(false);
	const [response, setResponse] = useState<number | 'latest' | 'error'>('latest');
	const [lastError, setLastError] = useState({ responseText: '', contentType: 'text' });
	const [isLoading, setLoading] = useState(false);
	const isDefault = endpointData.defaultRequest === requestData.id;
	if (requestData == null || endpointData == null || serviceData == null) {
		return <>Request data not found</>;
	}
	let responseData;
	if (response != 'error') {
		const responseIndex = response === 'latest' ? Math.max(requestData.history.length - 1, 0) : response;
		responseData =
			responseIndex >= requestData.history.length
				? defaultResponse
				: {
						responseText: requestData.history[responseIndex].response.body,
						contentType: requestData.history[responseIndex].response.bodyType,
				  };
	} else {
		responseData = lastError;
	}
	const fullQueryParams = { ...endpointData.baseQueryParams, ...requestData.queryParams };
	let queryStr = queryParamsToString(fullQueryParams);
	if (queryStr) {
		queryStr = `?${queryStr}`;
	}
	return (
		<>
			<EditableText
				text={requestData.name}
				setText={(newText: string) => applicationDataManager.update('request', props.id, { name: newText })}
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
									const result = await networkRequestManager.sendRequest(requestData, data);
									if (result) {
										setLastError({ contentType: 'json', responseText: result });
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
							<IconButton
								variant="outlined"
								color="primary"
								onClick={() => {
									tabsManager.selectTab(tabsContext, requestData.endpointId, 'endpoint');
								}}
							>
								<EditIcon />
							</IconButton>
						</ParticleEffectButton>
						<Switch
							checked={isDefault}
							onChange={(_event: React.ChangeEvent<HTMLInputElement>) =>
								applicationDataManager.update('endpoint', endpointData.id, {
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
								disabled={response === 0}
								onClick={() => {
									setResponse((currentResponse) => {
										if (currentResponse === 0) {
											return currentResponse;
										} else if (currentResponse === 'error') {
											return requestData.history.length - 1;
										} else if (currentResponse === 'latest') {
											return requestData.history.length - 2;
										} else {
											return currentResponse - 1;
										}
									});
								}}
							>
								<ArrowLeftIcon />
							</IconButton>
							<Typography sx={{ display: 'flex', alignItems: 'center' }}>
								{response === 'latest' || response === 'error' ? requestData.history.length : response + 1} /{' '}
								{requestData.history.length}
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
						<ResponseBody response={responseData} />
					</Card>
				</Grid>
			</Grid>
		</>
	);
}
