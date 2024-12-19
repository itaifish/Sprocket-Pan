import { Button, Select, Stack, Option, Input } from '@mui/joy';
import LabelIcon from '@mui/icons-material/Label';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { useSelector } from 'react-redux';
import { EnvironmentTypography } from '@/components/shared/EnvironmentTypography';
import { Constants } from '@/constants/constants';
import { verbColors } from '@/constants/style';
import { useComputedServiceEnvironment } from '@/hooks/useComputedEnvironment';
import { useDebounce } from '@/hooks/useDebounce';
import { EnvironmentContextResolver } from '@/managers/EnvironmentContextResolver';
import { selectEndpointById, selectServicesById } from '@/state/active/selectors';
import { activeActions } from '@/state/active/slice';
import { useAppDispatch } from '@/state/store';
import { tabsActions } from '@/state/tabs/slice';
import { RESTfulRequestVerbs } from '@/types/data/shared';
import { Endpoint } from '@/types/data/workspace';
import { PanelProps } from '../panels.interface';
import { EndpointEditTabs } from './EndpointEditTabs';
import { EditableHeader } from '../shared/EditableHeader';
import { SyncButton } from '@/components/shared/buttons/SyncButton';

export function EndpointPanel({ id }: PanelProps) {
	const dispatch = useAppDispatch();
	const endpoint = useSelector((state) => selectEndpointById(state, id));
	const service = useSelector((state) => selectServicesById(state, endpoint.serviceId));

	const computedEnv = useComputedServiceEnvironment(endpoint.serviceId);
	const envSnippets = EnvironmentContextResolver.stringWithVarsToSnippet(service?.baseUrl || 'unknown', computedEnv);

	const update = (values: Partial<Endpoint>) => {
		dispatch(activeActions.updateEndpoint({ ...values, id }));
	};

	const { localDataState, setLocalDataState } = useDebounce({
		state: endpoint.url,
		setState: (newUrl: string) => update({ url: newUrl }),
		debounceMS: Constants.debounceTimeMS,
	});

	if (endpoint == null || service == null) {
		return <>Endpoint data not found</>;
	}

	return (
		<Stack gap={2}>
			<EditableHeader value={endpoint.name} onChange={(name) => update({ name })} right={<SyncButton id={id} />} />
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
