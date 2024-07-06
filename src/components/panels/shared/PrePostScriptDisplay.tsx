import { Accordion, AccordionDetails, AccordionSummary } from '@mui/joy';

import { RequestScript } from '../script/RequestScript';

interface OnChangeArgs {
	preRequestScript?: string;
	postRequestScript?: string;
}

interface PrePostScriptDisplayProps extends OnChangeArgs {
	onChange: (args: OnChangeArgs) => void;
}

export function PrePostScriptDisplay({ preRequestScript, postRequestScript, onChange }: PrePostScriptDisplayProps) {
	return (
		<>
			<Accordion defaultExpanded>
				<AccordionSummary>Pre-Request Script</AccordionSummary>
				<AccordionDetails>
					<RequestScript
						scriptText={preRequestScript}
						scriptKey={'preRequestScript'}
						updateScript={(scriptText: string) => {
							onChange({ preRequestScript: scriptText });
						}}
					/>
				</AccordionDetails>
			</Accordion>
			<Accordion defaultExpanded>
				<AccordionSummary>Post-Request Script</AccordionSummary>
				<AccordionDetails>
					<RequestScript
						scriptText={postRequestScript}
						scriptKey={'postRequestScript'}
						updateScript={(scriptText: string) => {
							onChange({ postRequestScript: scriptText });
						}}
					/>
				</AccordionDetails>
			</Accordion>
		</>
	);
}
