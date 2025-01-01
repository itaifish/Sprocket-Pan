import { SprocketEditor } from '@/components/shared/input/monaco/SprocketEditor';
import { statusCodes } from '@/constants/statusCodes';
import { EndpointResponse } from '@/types/data/workspace';
import { SprocketError } from '@/types/state/state';
import { getStatusCodeColor } from '@/utils/string';
import { Accordion, AccordionDetails, AccordionGroup, AccordionSummary, Typography } from '@mui/joy';
import { useState } from 'react';

function getEditorLanguage(type?: EndpointResponse['bodyType']) {
	return ['json', 'html', 'xml', 'yaml'].find((lang) => type?.toLowerCase().includes(lang)) ?? 'text';
}

interface ResponseDisplayProps {
	response: EndpointResponse;
}

function ResponseDisplay({ response }: ResponseDisplayProps) {
	return (
		<SprocketEditor
			ActionBarItems={
				<>
					{response.statusCode ? (
						<Typography color={getStatusCodeColor(response.statusCode)} level="body-lg">
							{response.statusCode}: {statusCodes[response.statusCode]}
						</Typography>
					) : (
						<Typography>Response Code Missing</Typography>
					)}
				</>
			}
			height="45vh"
			value={response.body}
			language={getEditorLanguage(response.bodyType)}
			options={{ readOnly: true, domReadOnly: true }}
			formatOnChange
		/>
	);
}

interface ResponseBodyProps extends ResponseDisplayProps {
	error?: SprocketError;
}

export function ResponseBody({ response, error }: ResponseBodyProps) {
	const [index, setIndex] = useState(-1);
	if (error == null) return <ResponseDisplay response={response} />;
	return (
		<AccordionGroup>
			<Accordion expanded={index === 0} onChange={(_, ex) => setIndex(ex ? 0 : -1)}>
				<AccordionSummary>Error</AccordionSummary>
				<AccordionDetails>
					<SprocketEditor
						value={JSON.stringify(error)}
						height="40vh"
						language="json"
						options={{ readOnly: true, domReadOnly: true }}
						formatOnChange
					/>
				</AccordionDetails>
			</Accordion>
			<Accordion expanded={index === 1} onChange={(_, ex) => setIndex(ex ? 1 : -1)}>
				<AccordionSummary>Response</AccordionSummary>
				<AccordionDetails>
					<ResponseDisplay response={response} />
				</AccordionDetails>
			</Accordion>
		</AccordionGroup>
	);
}
