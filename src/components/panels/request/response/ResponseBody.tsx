import { SprocketEditor } from '@/components/shared/input/monaco/SprocketEditor';
import { EndpointResponse } from '@/types/data/workspace';
import { SprocketError } from '@/types/state/state';
import { getStatusCodeColor } from '@/utils/string';
import { Box, Typography } from '@mui/joy';
import { defaultResponse } from '../constants';
import { statusText } from '@/utils/misc';
import { ButtonTabs } from '@/components/shared/ButtonTabs';
import { Warning } from '@mui/icons-material';

const editorLanguageOptions = ['json', 'html', 'xml', 'yaml'];

export function getEditorLanguage(type?: EndpointResponse['bodyType']) {
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
					{statusText(response.statusCode)}
				</Typography>
			}
			// https://github.com/itaifish/Sprocket-Pan/issues/138
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
	if (error == null) {
		return <ResponseDisplay response={response} />;
	}
	return (
		<ButtonTabs
			tabs={[
				{
					title: 'Error',
					icon: <Warning />,
					color: 'danger',
					content: (
						<Box mt="-37px">
							<SprocketEditor
								value={JSON.stringify(error)}
								language="json"
								// weird bug https://github.com/itaifish/Sprocket-Pan/issues/138
								height="calc(100vh - 350px)"
								options={{ readOnly: true, domReadOnly: true }}
								formatOnChange
							/>
						</Box>
					),
				},
				{
					title: 'Response',
					content:
						response.body === defaultResponse.response.body ? (
							<Typography level="body-sm">No Response Found</Typography>
						) : (
							<Box mt="-37px">
								<ResponseDisplay response={response} />
							</Box>
						),
				},
			]}
		/>
	);
}
