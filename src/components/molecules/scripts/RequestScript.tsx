import { Monaco, Editor } from '@monaco-editor/react';
import { useColorScheme, Stack, IconButton, Tooltip } from '@mui/joy';
import { useState, useRef, useEffect } from 'react';
import { Constants } from '../../../utils/constants';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { FormatIcon } from '../../atoms/buttons/FormatIcon';

interface RequestScriptProps {
	scriptText: string | undefined;
	scriptKey: 'preRequestScript' | 'postRequestScript';
	updateScript: (scriptText: string) => void;
}

export function RequestScript(props: RequestScriptProps) {
	const { mode } = useColorScheme();
	const [editorText, setEditorText] = useState(props.scriptText ?? '');
	const latestText = useRef(editorText);
	const [copied, setCopied] = useState(false);
	const editorRef = useRef<any>(null);
	const format = () => {
		if (editorRef.current) {
			editorRef.current.getAction('editor.action.formatDocument').run();
		}
	};
	const handleEditorDidMount = (editor: any, _monaco: Monaco) => {
		editorRef.current = editor;
		format();
	};
	useEffect(() => {
		const delayDebounceFunc = setTimeout(() => {
			props.updateScript(latestText.current);
		}, Constants.debounceTimeMS);

		return () => clearTimeout(delayDebounceFunc);
	}, [latestText.current]);

	return (
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
							navigator.clipboard.writeText(latestText.current);
						}}
					>
						<ContentCopyIcon />
					</IconButton>
				</Tooltip>
			</Stack>

			<Editor
				height={'55vh'}
				value={editorText}
				onChange={(value) => {
					setEditorText(value ?? '');
					latestText.current = value ?? '';
				}}
				language={'typescript'}
				theme={mode === 'dark' ? 'vs-dark' : mode}
				options={{ tabSize: 2, insertSpaces: false }}
				onMount={handleEditorDidMount}
			/>
		</Stack>
	);
}
