import { Monaco, Editor } from '@monaco-editor/react';
import { useColorScheme, Stack } from '@mui/joy';
import { useState, useRef, useEffect } from 'react';
import { Constants } from '../../../utils/constants';
import { FormatIcon } from '../../atoms/buttons/FormatIcon';
import { defaultEditorOptions } from '../../../managers/MonacoInitManager';
import { CopyToClipboardButton } from '../../atoms/buttons/CopyToClipboardButton';

interface RequestScriptProps {
	scriptText: string | undefined;
	scriptKey: 'preRequestScript' | 'postRequestScript';
	updateScript: (scriptText: string) => void;
}

export function RequestScript(props: RequestScriptProps) {
	const { mode, systemMode } = useColorScheme();
	const resolvedMode = mode === 'system' ? systemMode : mode;
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
				<CopyToClipboardButton copied={copied} setCopied={setCopied} text={latestText.current} />
			</Stack>

			<Editor
				height={'55vh'}
				value={editorText}
				onChange={(value) => {
					setEditorText(value ?? '');
					latestText.current = value ?? '';
				}}
				language={'typescript'}
				theme={resolvedMode === 'dark' ? 'vs-dark' : resolvedMode}
				options={defaultEditorOptions}
				onMount={handleEditorDidMount}
			/>
		</Stack>
	);
}
