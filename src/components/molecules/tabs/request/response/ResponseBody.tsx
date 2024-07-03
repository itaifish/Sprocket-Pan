import { Stack, useColorScheme } from '@mui/joy';
import { Editor, Monaco } from '@monaco-editor/react';
import { useEffect, useRef, useState } from 'react';
import { log } from '../../../../../utils/logging';
import { FormatIcon } from '../../../../atoms/buttons/FormatIcon';
import { EndpointResponse } from '../../../../../types/application-data/application-data';
import { defaultEditorOptions } from '../../../../../managers/MonacoInitManager';
import { CopyToClipboardButton } from '../../../../atoms/buttons/CopyToClipboardButton';
import { editor } from 'monaco-editor';

export function ResponseBody({ response }: { response: EndpointResponse }) {
	const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
	const [copied, setCopied] = useState(false);
	const { mode, systemMode } = useColorScheme();
	const resolvedMode = mode === 'system' ? systemMode : mode;
	const format = () => {
		if (editorRef.current) {
			editorRef.current.updateOptions({ readOnly: false });
			log.info('run format');
			editorRef.current
				.getAction('editor.action.formatDocument')
				?.run()
				.then(() => {
					editorRef.current?.updateOptions({ readOnly: true });
				});
		}
	};
	const handleEditorDidMount = (editor: any, _monaco: Monaco) => {
		editorRef.current = editor;
		format();
	};

	let editorType = 'text';
	if (response.bodyType?.toLowerCase()?.includes('json')) {
		editorType = 'json';
	} else if (response.bodyType?.toLowerCase()?.includes('html')) {
		editorType = 'html';
	}

	useEffect(() => {
		format();
	}, [response.body, editorRef.current]);

	return (
		<div>
			<Stack>
				<Stack direction={'row'} spacing={2}>
					<FormatIcon actionFunction={() => format()} />
					<CopyToClipboardButton copied={copied} setCopied={setCopied} text={response.body} />
				</Stack>
				<Editor
					height={'45vh'}
					value={response.body}
					language={editorType}
					theme={resolvedMode === 'dark' ? 'vs-dark' : mode}
					options={{ readOnly: true, domReadOnly: true, ...defaultEditorOptions }}
					onMount={handleEditorDidMount}
				/>
			</Stack>
		</div>
	);
}
