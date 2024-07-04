import { AccordionGroup, Accordion, AccordionSummary, AccordionDetails } from '@mui/joy';
import { updateRequest } from '../../../state/active/slice';
import { useAppDispatch } from '../../../state/store';
import { EndpointRequest } from '../../../types/application-data/application-data';
import { RequestScript } from '../script/RequestScript';

export function RequestScripts({ request }: { request: EndpointRequest }) {
	const dispatch = useAppDispatch();
	function update(values: Partial<EndpointRequest>) {
		dispatch(updateRequest({ ...values, id: request.id }));
	}
	return (
		<AccordionGroup>
			<Accordion defaultExpanded>
				<AccordionSummary>Pre-request Script</AccordionSummary>
				<AccordionDetails>
					<RequestScript
						scriptText={request.preRequestScript}
						scriptKey={'preRequestScript'}
						updateScript={(scriptText) => update({ preRequestScript: scriptText })}
					/>
				</AccordionDetails>
			</Accordion>
			<Accordion defaultExpanded>
				<AccordionSummary>Post-request Script</AccordionSummary>
				<AccordionDetails>
					<RequestScript
						scriptText={request.postRequestScript}
						scriptKey={'postRequestScript'}
						updateScript={(scriptText) => update({ postRequestScript: scriptText })}
					/>
				</AccordionDetails>
			</Accordion>
		</AccordionGroup>
	);
}
