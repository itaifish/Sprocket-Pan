import {
	AccordionGroup,
	Accordion,
	AccordionSummary,
	AccordionDetails,
	useColorScheme,
	IconButton,
	Stack,
	Tooltip,
} from '@mui/joy';
import { EndpointRequest } from '../../../../types/application-data/application-data';
import { useState, useRef, useEffect } from 'react';
import { Editor, Monaco } from '@monaco-editor/react';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { applicationDataManager } from '../../../../managers/ApplicationDataManager';
import { Constants } from '../../../../utils/constants';

interface RequestScriptProps {
	request: EndpointRequest;
	scriptKey: 'preRequestScript' | 'postRequestScript';
}

function RequestScript({ request, scriptKey }: RequestScriptProps) {
	const { mode } = useColorScheme();
	const [editorText, setEditorText] = useState(request[scriptKey] ?? '');
	const latestText = useRef(editorText);
	const editorRef = useRef<any>(null);
	const [copied, setCopied] = useState(false);
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
			const updateObj = { [scriptKey]: latestText.current };
			applicationDataManager.update('request', request.id, updateObj);
		}, Constants.debounceTimeMS);

		return () => clearTimeout(delayDebounceFunc);
	}, [latestText.current]);

	return (
		<Stack>
			<Stack direction={'row'} spacing={2}>
				<IconButton onClick={() => format()}>
					<AutoFixHighIcon />
				</IconButton>
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

export function RequestScripts({ request }: { request: EndpointRequest }) {
	return (
		<>
			<AccordionGroup>
				<Accordion defaultExpanded>
					<AccordionSummary>Pre-request Script</AccordionSummary>
					<AccordionDetails>
						<RequestScript request={request} scriptKey={'preRequestScript'} />
					</AccordionDetails>
				</Accordion>
				<Accordion defaultExpanded>
					<AccordionSummary>Post-request Script</AccordionSummary>
					<AccordionDetails>
						<RequestScript request={request} scriptKey="postRequestScript" />
					</AccordionDetails>
				</Accordion>
			</AccordionGroup>
		</>
	);
}
