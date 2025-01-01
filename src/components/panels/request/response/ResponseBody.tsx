import { SprocketEditor } from '@/components/shared/input/monaco/SprocketEditor';
import { statusCodes } from '@/constants/statusCodes';
import { EndpointResponse } from '@/types/data/workspace';
import { SprocketError } from '@/types/state/state';
import { getStatusCodeColor } from '@/utils/string';
import { Typography } from '@mui/joy';

function getEditorLanguage(type?: EndpointResponse['bodyType']) {
	return ['json', 'html', 'xml', 'yaml'].find((lang) => type?.toLowerCase().includes(lang)) ?? 'text';
}

interface ResponseBodyProps {
	response: EndpointResponse;
	error?: SprocketError;
}

export function ResponseBody({ response, error }: ResponseBodyProps) {
	const lang = getEditorLanguage(response.bodyType);
	return (
		<>
			{JSON.stringify(error)}
			<SprocketEditor
				ActionBarItems={
					<>
						{response.statusCode != 0 && (
							<Typography color={getStatusCodeColor(response.statusCode)} level="body-lg">
								{response.statusCode}: {statusCodes[response.statusCode]}
							</Typography>
						)}
					</>
				}
				height="45vh"
				value={response.body}
				language={lang}
				options={{ readOnly: true, domReadOnly: true }}
				formatOnChange
			/>
		</>
	);
}
