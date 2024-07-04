import { AccordionGroup, Accordion, AccordionSummary, AccordionDetails } from '@mui/joy';
import { updateEndpoint } from '../../../state/active/slice';
import { useAppDispatch } from '../../../state/store';
import { Endpoint } from '../../../types/application-data/application-data';
import { RequestScript } from '../script/RequestScript';

export function EndpointScripts({ endpoint }: { endpoint: Endpoint }) {
	const dispatch = useAppDispatch();
	function update(values: Partial<Endpoint>) {
		dispatch(updateEndpoint({ ...values, id: endpoint.id }));
	}
	return (
		<>
			<AccordionGroup>
				<Accordion defaultExpanded>
					<AccordionSummary>Pre-request Script</AccordionSummary>
					<AccordionDetails>
						<RequestScript
							scriptText={endpoint.preRequestScript}
							scriptKey={'preRequestScript'}
							updateScript={(scriptText) => update({ preRequestScript: scriptText })}
						/>
					</AccordionDetails>
				</Accordion>
				<Accordion defaultExpanded>
					<AccordionSummary>Post-request Script</AccordionSummary>
					<AccordionDetails>
						<RequestScript
							scriptText={endpoint.postRequestScript}
							scriptKey={'postRequestScript'}
							updateScript={(scriptText) => update({ postRequestScript: scriptText })}
						/>
					</AccordionDetails>
				</Accordion>
			</AccordionGroup>
		</>
	);
}
