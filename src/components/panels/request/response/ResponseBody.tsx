import { SprocketEditor } from '@/components/shared/input/monaco/SprocketEditor';
import { statusCodes } from '@/constants/statusCodes';
import { EndpointResponse } from '@/types/data/workspace';
import { SprocketError } from '@/types/state/state';
import { getStatusCodeColor } from '@/utils/string';
import { Warning } from '@mui/icons-material';
import { Accordion, AccordionDetails, AccordionGroup, AccordionSummary, Typography } from '@mui/joy';
import { useState } from 'react';
import { defaultResponse } from '../constants';

const editorLanguageOptions = ['json', 'html', 'xml', 'yaml'];

function getEditorLanguage(type?: EndpointResponse['bodyType']) {
	return editorLanguageOptions.find((lang) => type?.toLowerCase().includes(lang)) ?? 'text';
}

interface ResponseDisplayProps {
	response: EndpointResponse;
}

function ResponseDisplay({ response }: ResponseDisplayProps) {
	return (
		<SprocketEditor
			ActionBarItems={
				<Typography color={getStatusCodeColor(response.statusCode)} level="body-lg">
					{response.statusCode}: {statusCodes[response.statusCode]}
				</Typography>
			}
			height="calc(100vh - 350px)"
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
	const [index, setIndex] = useState(0);
	if (error == null) return <ResponseDisplay response={response} />;
	return (
		<AccordionGroup>
			<Accordion expanded={index === 0} onChange={(_, ex) => setIndex(ex ? 0 : 1)}>
				<AccordionSummary>
					<Typography color="warning" startDecorator={<Warning sx={{ height: '20px' }} />}>
						Error
					</Typography>
				</AccordionSummary>
				<AccordionDetails>
					<SprocketEditor
						value={JSON.stringify(error)}
						language="json"
						// there's a weird interaction between joy's Accordion behavior and monaco's auto-resize
						// editors inside accordions must have a defined height that is not percentage-based
						height="calc(100vh - 350px)"
						options={{ readOnly: true, domReadOnly: true }}
						formatOnChange
					/>
				</AccordionDetails>
			</Accordion>
			<Accordion expanded={index === 1} onChange={(_, ex) => setIndex(ex ? 1 : 0)}>
				<AccordionSummary>Response</AccordionSummary>
				<AccordionDetails>
					{response.body === defaultResponse.response.body ? (
						<Typography level="body-sm">No Response Found</Typography>
					) : (
						<ResponseDisplay response={response} />
					)}
				</AccordionDetails>
			</Accordion>
		</AccordionGroup>
	);
}
