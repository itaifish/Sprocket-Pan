import { useColorScheme } from '@mui/joy';
import { Editor } from '@monaco-editor/react';
import { NetworkCallResponse } from '../../../../managers/NetworkRequestManager';

export function ResponseBody({ response }: { response: NetworkCallResponse }) {
	const { mode } = useColorScheme();
	let editorType = 'text';
	if (response.contentType?.toLowerCase()?.includes('json')) {
		editorType = 'json';
	} else if (response.contentType?.toLowerCase()?.includes('html')) {
		editorType = 'html';
	}
	return (
		<div>
			<Editor
				height={'45vh'}
				value={response.responseText}
				language={editorType}
				theme={mode === 'dark' ? 'vs-dark' : mode}
				options={{ readOnly: true, domReadOnly: true }}
			/>
		</div>
	);
}
