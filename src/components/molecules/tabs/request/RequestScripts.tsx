import { AccordionGroup, Accordion, AccordionSummary, AccordionDetails } from '@mui/joy';
import { EndpointRequest } from '../../../../types/application-data/application-data';
import { RequestScript } from '../../scripts/RequestScript';
import { applicationDataManager } from '../../../../managers/ApplicationDataManager';

export function RequestScripts({ request }: { request: EndpointRequest }) {
	return (
		<>
			<AccordionGroup>
				<Accordion defaultExpanded>
					<AccordionSummary>Pre-request Script</AccordionSummary>
					<AccordionDetails>
						<RequestScript
							scriptText={request.preRequestScript}
							scriptKey={'preRequestScript'}
							updateScript={(scriptText) => {
								const updateObj = { preRequestScript: scriptText };
								applicationDataManager.update('request', request.id, updateObj);
							}}
						/>
					</AccordionDetails>
				</Accordion>
				<Accordion defaultExpanded>
					<AccordionSummary>Post-request Script</AccordionSummary>
					<AccordionDetails>
						<RequestScript
							scriptText={request.preRequestScript}
							scriptKey={'postRequestScript'}
							updateScript={(scriptText) => {
								const updateObj = { postRequestScript: scriptText };
								applicationDataManager.update('request', request.id, updateObj);
							}}
						/>
					</AccordionDetails>
				</Accordion>
			</AccordionGroup>
		</>
	);
}
