import { AccordionGroup, Accordion, AccordionSummary, AccordionDetails } from '@mui/joy';
import { Endpoint } from '../../../../types/application-data/application-data';
import { RequestScript } from '../../scripts/RequestScript';
import { applicationDataManager } from '../../../../managers/ApplicationDataManager';

export function EndpointScripts({ endpoint }: { endpoint: Endpoint }) {
	return (
		<>
			<AccordionGroup>
				<Accordion defaultExpanded>
					<AccordionSummary>Pre-request Script</AccordionSummary>
					<AccordionDetails>
						<RequestScript
							scriptText={endpoint.preRequestScript}
							scriptKey={'preRequestScript'}
							updateScript={(scriptText) => {
								const updateObj = { preRequestScript: scriptText };
								applicationDataManager.update('endpoint', endpoint.id, updateObj);
							}}
						/>
					</AccordionDetails>
				</Accordion>
				<Accordion defaultExpanded>
					<AccordionSummary>Post-request Script</AccordionSummary>
					<AccordionDetails>
						<RequestScript
							scriptText={endpoint.postRequestScript}
							scriptKey={'postRequestScript'}
							updateScript={(scriptText) => {
								const updateObj = { postRequestScript: scriptText };
								applicationDataManager.update('endpoint', endpoint.id, updateObj);
							}}
						/>
					</AccordionDetails>
				</Accordion>
			</AccordionGroup>
		</>
	);
}
