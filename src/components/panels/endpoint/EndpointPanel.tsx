import { Button, Grid, Select, Stack, Option, Input } from '@mui/joy';
import { environmentContextResolver } from '../../../managers/EnvironmentContextResolver';
import { Endpoint, RESTfulRequestVerbs } from '../../../types/application-data/application-data';
import { verbColors } from '../../../utils/style';
import LabelIcon from '@mui/icons-material/Label';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';

import {
	selectEndpoints,
	selectEnvironments,
	selectRequests,
	selectSelectedEnvironment,
	selectServices,
	selectSettings,
} from '../../../state/active/selectors';
import { useSelector } from 'react-redux';
import { updateEndpoint } from '../../../state/active/slice';
import { useAppDispatch } from '../../../state/store';
import { useDebounce } from '../../../hooks/useDebounce';
import { Constants } from '../../../utils/constants';
import { addTabs, setSelectedTab } from '../../../state/tabs/slice';
import { EditableText } from '../../shared/input/EditableText';
import { PanelProps } from '../panels.interface';
import { EndpointEditTabs } from './EndpointEditTabs';

export function EndpointPanel({ id }: PanelProps) {
	const endpoints = useSelector(selectEndpoints);
	const services = useSelector(selectServices);
	const settings = useSelector(selectSettings);
	const selectedEnvironment = useSelector(selectSelectedEnvironment);
	const environments = useSelector(selectEnvironments);
	const requests = useSelector(selectRequests);
	const endpointData = endpoints[id];
	const serviceData = services[endpointData.serviceId];
	const dispatch = useAppDispatch();

	const update = (values: Partial<Endpoint>) => {
		dispatch(updateEndpoint({ ...values, id }));
	};

	const { localDataState, setLocalDataState } = useDebounce({
		state: endpointData.url,
		setState: (newUrl: string) => update({ url: newUrl }),
		debounceOverride: Constants.debounceTimeMS,
	});

	if (endpointData == null || serviceData == null) {
		return <>Endpoint data not found</>;
	}

	return (
		<>
			<EditableText
				text={endpointData.name}
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
						onChange={(_e, newVerb) => {
							if (newVerb) {
								update({ verb: newVerb });
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
						startDecorator={environmentContextResolver.stringWithVarsToTypography(
							serviceData.baseUrl || 'unknown',
							{ environments, selectedEnvironment, services, settings, requests },
							serviceData.id,
							undefined,
							{ variant: 'outlined', color: 'primary' },
						)}
						value={localDataState}
						onChange={(e) => {
							setLocalDataState(e.target.value);
						}}
						color="primary"
					></Input>
				</Grid>
				<Grid xs={2}>
					<Stack direction={'row'} spacing={2}>
						<Button
							color="primary"
							startDecorator={<ExitToAppIcon />}
							disabled={!endpointData.defaultRequest}
							onClick={() => {
								if (endpointData.defaultRequest) {
									dispatch(addTabs({ [endpointData.defaultRequest]: 'request' }));
									dispatch(setSelectedTab(endpointData.defaultRequest));
								}
							}}
						>
							Jump To Request
						</Button>
					</Stack>
				</Grid>
			</Grid>
			<EndpointEditTabs endpoint={endpointData} />
		</>
	);
}
