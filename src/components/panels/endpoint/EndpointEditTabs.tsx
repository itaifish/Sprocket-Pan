import { AccordionGroup } from '@mui/joy';
import { useAppDispatch } from '../../../state/store';
import { Endpoint } from '../../../types/application-data/application-data';
import { PrePostScriptDisplay } from '../shared/PrePostScriptDisplay';
import { EditableData } from '../../shared/input/EditableData';
import { useComputedServiceEnvironment } from '../../../hooks/useComputedEnvironment';
import { activeActions } from '../../../state/active/slice';
import { SprocketTabs } from '../../shared/SprocketTabs';

export function EndpointEditTabs({ endpoint }: { endpoint: Endpoint }) {
	const envPairs = useComputedServiceEnvironment(endpoint.serviceId);
	const dispatch = useAppDispatch();
	function update(values: Partial<Endpoint>) {
		dispatch(activeActions.updateEndpoint({ ...values, id: endpoint.id }));
	}
	return (
		<SprocketTabs
			tabs={[
				{
					title: 'Headers',
					content: (
						<EditableData
							initialValues={endpoint.baseHeaders}
							onChange={(baseHeaders) => update({ baseHeaders })}
							envPairs={envPairs}
						/>
					),
				},
				{
					title: 'Query Params',
					content: (
						<EditableData
							initialValues={endpoint.baseQueryParams}
							onChange={(baseQueryParams) => update({ baseQueryParams })}
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
								preRequestScript={endpoint.preRequestScript}
								postRequestScript={endpoint.postRequestScript}
							/>
						</AccordionGroup>
					),
				},
			]}
		/>
	);
}
