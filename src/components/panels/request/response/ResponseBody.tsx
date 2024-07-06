import { Typography } from '@mui/joy';
import { EndpointResponse } from '../../../../types/application-data/application-data';
import { statusCodes } from '../../../../utils/string';
import { SprocketEditor } from '../../../shared/input/SprocketEditor';

export function ResponseBody({ response }: { response: EndpointResponse }) {
	let editorType = 'text';
	if (response.bodyType?.toLowerCase()?.includes('json')) {
		editorType = 'json';
	} else if (response.bodyType?.toLowerCase()?.includes('html')) {
		editorType = 'html';
	}

	return (
		<SprocketEditor
			ActionBarItems={
				<Typography>
					{response.statusCode}: {statusCodes[response.statusCode]}
				</Typography>
			}
			height={'45vh'}
			value={response.body}
			language={editorType}
			options={{ readOnly: true, domReadOnly: true }}
			formatOnChange
		/>
	);
}
