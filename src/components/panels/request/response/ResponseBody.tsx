import { Typography } from '@mui/joy';
import { EndpointResponse } from '../../../../types/application-data/application-data';
import { statusCodes } from '../../../../utils/string';
import { SprocketEditor } from '../../../shared/input/SprocketEditor';

export function ResponseBody({ response }: { response: EndpointResponse }) {
	let editorType = 'text';
	const otherOptions = ['json', 'html', 'xml', 'yaml'];
	for (const option of otherOptions) {
		if (response.bodyType?.toLowerCase()?.includes(option)) {
			editorType = option;
			break;
		}
	}
	return (
		<SprocketEditor
			ActionBarItems={
				<>
					{response.statusCode != 0 && (
						<Typography>
							{response.statusCode}: {statusCodes[response.statusCode]}
						</Typography>
					)}
				</>
			}
			height={'45vh'}
			// this is to maintain backwards compatibility with the old way we stored response bodies
			value={typeof response.body === 'string' ? response.body : JSON.stringify(response.body)}
			language={editorType}
			options={{ readOnly: true, domReadOnly: true }}
			formatOnChange
		/>
	);
}
