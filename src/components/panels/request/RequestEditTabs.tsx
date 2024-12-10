import { AccordionGroup } from '@mui/joy';
import { RequestBody } from './RequestBody';
import { useAppDispatch } from '../../../state/store';
import { EndpointRequest } from '../../../types/application-data/application-data';
import { PrePostScriptDisplay } from '../shared/PrePostScriptDisplay';
import { EditableData } from '../../shared/input/EditableData';
import { SprocketTabs } from '../../shared/SprocketTabs';
import { useComputedRequestEnvironment } from '../../../hooks/useComputedEnvironment';
import { activeActions } from '../../../state/active/slice';
import { RequestInfoSection } from './RequestInfoSection';

export function RequestEditTabs({ request }: { request: EndpointRequest }) {
	const envPairs = useComputedRequestEnvironment(request.id).toArray();
	const dispatch = useAppDispatch();
	function update(values: Partial<EndpointRequest>) {
		dispatch(activeActions.updateRequest({ ...values, id: request.id }));
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
				{
					title: 'Info',
					content: <RequestInfoSection request={request} />,
				},
			]}
		/>
	);
}
