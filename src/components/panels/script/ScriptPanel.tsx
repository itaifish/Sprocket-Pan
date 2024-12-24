import { useSelector } from 'react-redux';
import { Stack, Typography } from '@mui/joy';
import { Editor, Monaco } from '@monaco-editor/react';
import { useState, useRef, useEffect } from 'react';
import { editor } from 'monaco-editor';
import { CopyToClipboardButton } from '@/components/shared/buttons/CopyToClipboardButton';
import { FormatButton } from '@/components/shared/buttons/FormatButton';
import { Constants } from '@/constants/constants';
import { useDebounce } from '@/hooks/useDebounce';
import { useEditorTheme } from '@/hooks/useEditorTheme';
import { defaultEditorOptions } from '@/managers/monaco/MonacoInitManager';
import { selectScript, selectScripts } from '@/state/active/selectors';
import { activeActions } from '@/state/active/slice';
import { runScript } from '@/state/active/thunks/requests';
import { useAppDispatch } from '@/state/store';
import { Script } from '@/types/data/workspace';
import { sleep } from '@/utils/misc';
import { toValidFunctionName } from '@/utils/string';
import { PanelProps } from '../panels.interface';
import { EditableHeader } from '../shared/EditableHeader';
import { SyncButton } from '@/components/shared/buttons/SyncButton';
import { ScriptActions } from './ScriptActions';

export function ScriptPanel({ id }: PanelProps) {
	const theme = useEditorTheme();
	const script = useSelector((state) => selectScript(state, id));
	const scripts = useSelector(selectScripts);
	const scriptNames = new Set(Object.values(scripts).map((script) => script.name));
	const [isRunning, setRunning] = useState(false);
	const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
	const scriptReturnEditorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
	const [scriptOutput, setScriptOutput] = useState('');
	const [scriptOutputLang, setScriptOutputLang] = useState<'json' | 'javascript'>('json');
	const format = () => {
		if (editorRef.current) {
			editorRef.current.getAction('editor.action.formatDocument')?.run();
		}
	};

	const formatReturnEditor = () => {
		if (scriptReturnEditorRef.current) {
			scriptReturnEditorRef.current.updateOptions({ readOnly: false });
			scriptReturnEditorRef.current
				.getAction('editor.action.formatDocument')
				?.run()
				.then(() => {
					scriptReturnEditorRef.current?.updateOptions({ readOnly: true });
				});
		}
	};

	useEffect(() => {
		formatReturnEditor();
	}, [scriptOutput]);

	const handleMainEditorDidMount = (editor: editor.IStandaloneCodeEditor, _monaco: Monaco) => {
		editorRef.current = editor;
		format();
	};
	const handleReturnEditorDidMount = (editor: editor.IStandaloneCodeEditor, _monaco: Monaco) => {
		scriptReturnEditorRef.current = editor;
		formatReturnEditor();
	};
	const dispatch = useAppDispatch();
	function update(values: Partial<Script>) {
		dispatch(activeActions.updateScript({ ...values, id: script.id }));
	}
	const { localDataState, setLocalDataState, isDebouncing } = useDebounce({
		state: script.content,
		setState: (newText: string) => update({ content: newText }),
		debounceMS: Constants.longEditTimeMS,
	});

	const run = async () => {
		try {
			setRunning(true);
			const result = dispatch(runScript({ script: { ...script, content: localDataState }, requestId: null })).unwrap();
			await sleep(Constants.minimumScriptRunTimeMS);
			const output = await result;
			if (typeof output === 'function') {
				setScriptOutputLang('javascript');
				setScriptOutput(output.toString());
			} else {
				setScriptOutputLang('json');
				setScriptOutput(JSON.stringify(output));
			}
		} catch (e) {
			setScriptOutputLang('json');
			setScriptOutput(JSON.stringify({ error: (e as any)?.message ?? 'An error occurred' }));
		} finally {
			setRunning(false);
		}
	};

	const interrupt = () => {
		// TODO: do a proper interruptus
		setRunning(false);
	};

	return (
		<>
			<EditableHeader
				value={script.name}
				onChange={(name) => update({ name, id, scriptCallableName: toValidFunctionName(name) })}
				isValidFunc={(text) => text.length >= 1 && (!scriptNames.has(text) || text == script.name)}
				right={<SyncButton id={id} />}
			/>
			<ScriptActions
				script={script}
				onChange={update}
				isRunning={isRunning}
				isDebouncing={isDebouncing}
				run={run}
				interrupt={interrupt}
			/>
			<Stack direction="row" spacing={2}>
				<FormatButton onChange={format} />
				<CopyToClipboardButton copyText={localDataState} />
			</Stack>
			<Editor
				value={localDataState}
				onChange={(value) => {
					if (value != null) {
						setLocalDataState(value);
					}
				}}
				language="typescript"
				theme={theme}
				options={defaultEditorOptions}
				onMount={handleMainEditorDidMount}
			/>
			<Typography level="h3" sx={{ textAlign: 'center', my: '15px' }}>
				Return Variable Output
			</Typography>
			<Editor
				value={scriptOutput}
				language={scriptOutputLang}
				theme={theme}
				options={{ readOnly: true, domReadOnly: true, ...defaultEditorOptions }}
				onMount={handleReturnEditorDidMount}
			/>
		</>
	);
}
