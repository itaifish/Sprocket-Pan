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
import { getPreScriptInjectionCode } from '../../../../managers/ScriptInjectionManager';
import { log } from '../../../../utils/logging';

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

	const handleEditorDidMount = (editor: any, monaco: Monaco) => {
		editorRef.current = editor;
		const uri = `ts:src/lib_${request.id}${scriptKey}.ts`;
		const existingModel = monaco.editor.getModel(uri);
		if (existingModel) {
			log.info(`disposing of existingModel`);
			existingModel.dispose();
		}
		monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
			noSemanticValidation: false,
			noSyntaxValidation: false,
		});
		monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
			diagnosticCodesToIgnore: [
				1375, //'await' expressions are only allowed at the top level of a file when that file is a module
				1378, //Top-level 'await' expressions are only allowed when the 'module' option is set to 'esnext' or 'system', and the 'target' option is set to 'es2017' or higher
			],
		});
		monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
			target: monaco.languages.typescript.ScriptTarget.ESNext,
			module: monaco.languages.typescript.ModuleKind.ESNext,
			allowNonTsExtensions: true,
			alwaysStrict: true,
			noUnusedParameters: true,
			noImplicitUseStrict: true,
			noUnusedLocals: true,
		});

		monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);
		monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);

		const injectedCode = `
				const sprocketPan = ${getPreScriptInjectionCode.toString()}({} as any, {} as any);
				const sp = sprocketPan;
			`;
		monaco.editor.createModel(injectedCode, 'typescript', uri);

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
		<Stack sx={{ zIndex: 150 }}>
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
