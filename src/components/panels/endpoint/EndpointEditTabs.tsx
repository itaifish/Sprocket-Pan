import { EditableData } from '@/components/shared/input/EditableData';
import { SprocketTabs } from '@/components/shared/SprocketTabs';
import { useComputedServiceEnvironment } from '@/hooks/useComputedEnvironment';
import { activeActions } from '@/state/active/slice';
import { useAppDispatch } from '@/state/store';
import { Endpoint } from '@/types/data/workspace';
import { AccordionGroup } from '@mui/joy';
import { PrePostScriptDisplay } from '../shared/PrePostScriptDisplay';

export function EndpointEditTabs({ endpoint }: { endpoint: Endpoint }) {
	const envPairs = useComputedServiceEnvironment(endpoint.serviceId).toArray();
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
