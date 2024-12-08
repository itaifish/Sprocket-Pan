import { Button, Select, Stack, Option, Input } from '@mui/joy';
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
import { useAppDispatch } from '../../../state/store';
import { useDebounce } from '../../../hooks/useDebounce';
import { EditableText } from '../../shared/input/EditableText';
import { PanelProps } from '../panels.interface';
import { EndpointEditTabs } from './EndpointEditTabs';
import { tabsActions } from '../../../state/tabs/slice';
import { Constants } from '../../../constants/constants';
import { EnvironmentTypography } from '../../shared/EnvironmentTypography';
import { verbColors } from '../../../constants/style';
import { activeActions } from '../../../state/active/slice';

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
		dispatch(activeActions.updateEndpoint({ ...values, id }));
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
			<Stack direction="row" gap={2}>
				<Select
					sx={{ minWidth: 150 }}
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
				<Input
					sx={{ flexGrow: 1 }}
					startDecorator={
						<EnvironmentTypography typographyProps={{ variant: 'outlined', color: 'primary' }} snippets={envSnippets} />
					}
					value={localDataState}
					onChange={(e) => {
						setLocalDataState(e.target.value);
					}}
					color="primary"
				/>
				<Button
					sx={{ minWidth: 150 }}
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
					Jump to Request
				</Button>
			</Stack>
			<EndpointEditTabs endpoint={endpoint} />
		</Stack>
	);
}
