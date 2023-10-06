import {
	Grid,
	Select,
	Option,
	ColorPaletteProp,
	OptionPropsColorOverrides,
	Input,
	Typography,
	Button,
	Stack,
	IconButton,
	useTheme,
	useColorScheme,
	Card,
} from '@mui/joy';
import { TabProps } from './TabContent';
import { RESTfulRequestVerb, RESTfulRequestVerbs } from '../../../types/application-data/application-data';
import { useContext, useState } from 'react';
import SendIcon from '@mui/icons-material/Send';
import { OverridableStringUnion } from '@mui/types';
import { ApplicationDataContext } from '../../../App';
import EditIcon from '@mui/icons-material/Edit';
import ParticleEffectButton from 'react-particle-effect-button';
import { rgbToHex } from '@mui/material';
import { RequestBody } from './request/RequestBody';

const verbColors: Record<RESTfulRequestVerb, OverridableStringUnion<ColorPaletteProp, OptionPropsColorOverrides>> = {
	GET: 'primary',
	POST: 'success',
	DELETE: 'danger',
	PUT: 'warning',
	PATCH: 'warning',
	OPTIONS: 'neutral',
	HEAD: 'neutral',
};

export function RequestTab(props: TabProps) {
	const data = useContext(ApplicationDataContext);
	const requestData = data.requests[props.id];
	const endpointData = data.endpoints[requestData.endpointId];
	const serviceData = data.services[endpointData?.serviceId];
	const theme = useTheme();
	const { mode } = useColorScheme();
	const [hidden, setHidden] = useState(false);
	const color = theme.palette.primary[mode === 'light' ? 'lightChannel' : 'darkChannel'];
	const colorRgb = `rgb(${color.replaceAll(' ', ', ')})`;
	const hexColor = rgbToHex(colorRgb);
	const [isAnimating, setIsAnimating] = useState(false);
	if (requestData == null || endpointData == null || serviceData == null) {
		return <>Request data not found</>;
	}
	return (
		<>
			<Typography level="h2" sx={{ textAlign: 'center' }}>
				{requestData.name}
			</Typography>
			<Grid container spacing={2} sx={{ paddingTop: '30px' }} alignItems="center" justifyContent={'center'}>
				<Grid xs={2}>
					<Select
						value={endpointData.verb}
						startDecorator={<SendIcon />}
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
				<Grid xs={8}>
					<Input
						placeholder="URL"
						variant="outlined"
						color={'primary'}
						value={`${serviceData.baseUrl}${endpointData.url}`}
						onFocus={() => {
							if (!isAnimating) {
								setHidden(true);
							}
						}}
					/>
				</Grid>
				<Grid xs={2}>
					<Stack direction={'row'} spacing={2}>
						<Button color="primary">Send</Button>
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
							<IconButton variant="outlined" color="primary">
								<EditIcon />
							</IconButton>
						</ParticleEffectButton>
					</Stack>
				</Grid>
			</Grid>
			<Grid container direction={'row'} spacing={1} sx={{ height: '100%' }}>
				<Grid xs={6}>
					<Card>
						<Typography level="h3" sx={{ textAlign: 'center' }}>
							Request
						</Typography>
						<RequestBody requestData={requestData} />
					</Card>
				</Grid>
				<Grid xs={6}>
					<Card>
						<Typography level="h3" sx={{ textAlign: 'center' }}>
							Response
						</Typography>
					</Card>
				</Grid>
			</Grid>
		</>
	);
}
