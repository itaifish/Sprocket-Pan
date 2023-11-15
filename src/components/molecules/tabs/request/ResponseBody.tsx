import { IconButton, Stack, Tooltip, useColorScheme } from '@mui/joy';
import { Editor, Monaco } from '@monaco-editor/react';
import { NetworkCallResponse } from '../../../../managers/NetworkRequestManager';
import { useEffect, useRef, useState } from 'react';
import { log } from '../../../../utils/logging';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { FormatIcon } from '../../../atoms/buttons/FormatIcon';

export function ResponseBody({ response }: { response: NetworkCallResponse }) {
	const editorRef = useRef<any>(null);
	const [copied, setCopied] = useState(false);
	const { mode, systemMode } = useColorScheme();
	const resolvedMode = mode === 'system' ? systemMode : mode;
	const format = () => {
		if (editorRef.current) {
			editorRef.current.updateOptions({ readOnly: false });
			log.info('run format');
			editorRef.current
				.getAction('editor.action.formatDocument')
				.run()
				.then(() => {
					editorRef.current.updateOptions({ readOnly: true });
				});
		}
	};
	const handleEditorDidMount = (editor: any, _monaco: Monaco) => {
		editorRef.current = editor;
		format();
	};

	let editorType = 'text';
	if (response.contentType?.toLowerCase()?.includes('json')) {
		editorType = 'json';
	} else if (response.contentType?.toLowerCase()?.includes('html')) {
		editorType = 'html';
	}

	useEffect(() => {
		format();
	}, [response.responseText, editorRef.current]);

	return (
		<div>
			<Stack>
				<Stack direction={'row'} spacing={2}>
					<FormatIcon actionFunction={() => format()} />
					<Tooltip title="✓ Copied to clipboard!" arrow open={copied} placement="right" color="primary">
						<IconButton
							disabled={copied}
							onClick={() => {
								setCopied(true);
								setTimeout(() => {
									setCopied(false);
								}, 800);
								navigator.clipboard.writeText(response.responseText);
							}}
						>
							<ContentCopyIcon />
						</IconButton>
					</Tooltip>
				</Stack>
				<Editor
					height={'45vh'}
					value={response.responseText}
					language={editorType}
					theme={resolvedMode === 'dark' ? 'vs-dark' : mode}
					options={{ readOnly: true, domReadOnly: true, tabSize: 2, insertSpaces: false }}
					onMount={handleEditorDidMount}
				/>
			</Stack>
		</div>
	);
}
