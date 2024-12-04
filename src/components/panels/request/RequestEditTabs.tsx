import { AccordionGroup } from '@mui/joy';
import { RequestBody } from './RequestBody';
import { useSelector } from 'react-redux';
import { EnvironmentContextResolver } from '../../../managers/EnvironmentContextResolver';
import {
	selectSecrets,
	selectSelectedEnvironmentValue,
	selectServiceSelectedEnvironmentValue,
	selectEndpointById,
	selectEnvironments,
} from '../../../state/active/selectors';
import { updateRequest } from '../../../state/active/slice';
import { useAppDispatch } from '../../../state/store';
import { EndpointRequest } from '../../../types/application-data/application-data';
import { PrePostScriptDisplay } from '../shared/PrePostScriptDisplay';
import { EditableData } from '../../shared/input/EditableData';
import { SprocketTabs } from '../../shared/SprocketTabs';

export function RequestEditTabs({ request }: { request: EndpointRequest }) {
	const secrets = useSelector(selectSecrets);
	const reqEnv = request.environmentOverride;
	const rootEnv = useSelector(selectSelectedEnvironmentValue);
	const endpoint = useSelector((state) => selectEndpointById(state, request.endpointId));
	const servEnv = useSelector((state) => selectServiceSelectedEnvironmentValue(state, endpoint.serviceId));
	const environments = useSelector(selectEnvironments);
	const envPairs = EnvironmentContextResolver.buildEnvironmentVariables({
		reqEnv,
		secrets,
		rootEnv,
		servEnv,
		rootAncestors: Object.values(environments),
	}).toArray();
	const dispatch = useAppDispatch();
	function update(values: Partial<EndpointRequest>) {
		dispatch(updateRequest({ ...values, id: request.id }));
	}

	return (
		<SprocketTabs
			tabs={[
				{ title: 'Body', content: <RequestBody request={request} /> },
				{
					title: 'Headers',
					content: (
						<EditableData
							initialValues={request.headers}
							onChange={(values) => update({ headers: values })}
							envPairs={envPairs}
						/>
					),
				},
				{
					title: 'Query Params',
					content: (
						<EditableData
							initialValues={request.queryParams}
							onChange={(queryParams) => update({ queryParams })}
							envPairs={envPairs}
						/>
					),
				},
				{
					title: 'Scripts',
					content: (
						<AccordionGroup>
							<PrePostScriptDisplay
								onChange={update}
								preRequestScript={request.preRequestScript}
								postRequestScript={request.postRequestScript}
							/>
						</AccordionGroup>
					),
				},
				{
					title: 'Environment',
					content: (
						<EditableData
							initialValues={request.environmentOverride?.pairs ?? []}
							onChange={(pairs) => update({ environmentOverride: { ...request.environmentOverride, pairs } })}
							envPairs={envPairs}
						/>
					),
				},
			]}
		/>
	);
}
