import { Button, Grid, Select, Stack, Option, Input } from '@mui/joy';
import { EnvironmentContextResolver } from '../../../managers/EnvironmentContextResolver';
import { Endpoint, RESTfulRequestVerbs } from '../../../types/application-data/application-data';
import LabelIcon from '@mui/icons-material/Label';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';

import {
	selectEndpointById,
	selectSecrets,
	selectSelectedEnvironmentValue,
	selectServicesById,
	selectServiceSelectedEnvironmentValue,
} from '../../../state/active/selectors';
import { useSelector } from 'react-redux';
import { updateEndpoint } from '../../../state/active/slice';
import { useAppDispatch } from '../../../state/store';
import { useDebounce } from '../../../hooks/useDebounce';
import { EditableText } from '../../shared/input/EditableText';
import { PanelProps } from '../panels.interface';
import { EndpointEditTabs } from './EndpointEditTabs';
import { tabsActions } from '../../../state/tabs/slice';
import { Constants } from '../../../constants/constants';
import { EnvironmentTypography } from '../../shared/EnvironmentTypography';
import { verbColors } from '../../../constants/style';

export function EndpointPanel({ id }: PanelProps) {
	const dispatch = useAppDispatch();
	const endpoint = useSelector((state) => selectEndpointById(state, id));
	const service = useSelector((state) => selectServicesById(state, endpoint.serviceId));
	const secrets = useSelector(selectSecrets);
	const servEnv = useSelector((state) => selectServiceSelectedEnvironmentValue(state, endpoint.serviceId));
	const rootEnv = useSelector(selectSelectedEnvironmentValue);

	const envSnippets = EnvironmentContextResolver.stringWithVarsToSnippet(service?.baseUrl || 'unknown', {
		secrets,
		servEnv,
		rootEnv,
	});

	const update = (values: Partial<Endpoint>) => {
		dispatch(updateEndpoint({ ...values, id }));
	};

	const { localDataState, setLocalDataState } = useDebounce({
		state: endpoint.url,
		setState: (newUrl: string) => update({ url: newUrl }),
		debounceOverride: Constants.debounceTimeMS,
	});

	if (endpoint == null || service == null) {
		return <>Endpoint data not found</>;
	}

	return (
		<Stack gap={2}>
			<EditableText
				sx={{ margin: 'auto' }}
				text={endpoint.name}
				setText={(newText: string) => update({ name: newText })}
				isValidFunc={(text: string) => text.length >= 1}
				level="h2"
			/>
			<Grid container spacing={2} alignItems="center" justifyContent={'center'}>
				<Grid xs={2}>
					<Select
						value={endpoint.verb}
						startDecorator={<LabelIcon />}
						color={verbColors[endpoint.verb]}
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
						startDecorator={
							<EnvironmentTypography
								typographyProps={{ variant: 'outlined', color: 'primary' }}
								snippets={envSnippets}
							/>
						}
						value={localDataState}
						onChange={(e) => {
							setLocalDataState(e.target.value);
						}}
						color="primary"
					></Input>
				</Grid>
				<Grid xs={2}>
					<Stack direction="row" spacing={2}>
						<Button
							color="primary"
							startDecorator={<ExitToAppIcon />}
							disabled={!endpoint.defaultRequest}
							onClick={() => {
								if (endpoint.defaultRequest) {
									dispatch(tabsActions.addTabs({ [endpoint.defaultRequest]: 'request' }));
									dispatch(tabsActions.setSelectedTab(endpoint.defaultRequest));
								}
							}}
						>
							Jump To Request
						</Button>
					</Stack>
				</Grid>
			</Grid>
			<EndpointEditTabs endpoint={endpoint} />
		</Stack>
	);
}
