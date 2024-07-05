import { useSelector } from 'react-redux';
import { selectScript, selectScripts, selectSettings } from '../../../state/active/selectors';
import { useAppDispatch } from '../../../state/store';
import { updateScript } from '../../../state/active/slice';
import {
	Button,
	CircularProgress,
	FormControl,
	FormLabel,
	Input,
	ListItemDecorator,
	Option,
	Select,
	Stack,
	Typography,
	useColorScheme,
} from '@mui/joy';
import { Editor, Monaco } from '@monaco-editor/react';
import { useState, useRef, useMemo, useEffect } from 'react';
import { Script } from '../../../types/application-data/application-data';
import { defaultEditorOptions } from '../../../managers/MonacoInitManager';
import { useDebounce } from '../../../hooks/useDebounce';
import { Constants } from '../../../utils/constants';
import { toValidFunctionName } from '../../../utils/string';
import Code from '@mui/icons-material/Code';
import AssignmentReturnedIcon from '@mui/icons-material/AssignmentReturned';
import { asyncCallWithTimeout, getVariablesFromCode } from '../../../utils/functions';
import FunctionsIcon from '@mui/icons-material/Functions';
import ClassIcon from '@mui/icons-material/Class';
import InventoryIcon from '@mui/icons-material/Inventory';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { runScript } from '../../../state/active/thunks/requests';
import { editor } from 'monaco-editor';
import { PanelProps } from '../panels.interface';
import { CopyToClipboardButton } from '../../shared/buttons/CopyToClipboardButton';
import { FormatIcon } from '../../shared/buttons/FormatIcon';
import { EditableText } from '../../shared/input/EditableText';

const iconMap: Record<'function' | 'variable' | 'class', JSX.Element> = {
	function: <FunctionsIcon />,
	class: <ClassIcon />,
	variable: <InventoryIcon />,
};

export function ScriptPanel({ id }: PanelProps) {
	const script = useSelector((state) => selectScript(state, id));
	const scripts = useSelector(selectScripts);
	const scriptNames = new Set(Object.values(scripts).map((script) => script.name));
	const { mode, systemMode } = useColorScheme();
	const resolvedMode = mode === 'system' ? systemMode : mode;
	const [copied, setCopied] = useState(false);
	const [isRunning, setRunning] = useState(false);
	const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
	const scriptReturnEditorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
	const settings = useSelector(selectSettings);
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
		dispatch(updateScript({ ...values, id: script.id }));
	}
	const { localDataState, setLocalDataState } = useDebounce({
		state: script.content,
		setState: (newText: string) => update({ content: newText }),
		debounceOverride: Constants.longEditTimeMS,
	});

	const scriptCallableNameDebounce = useDebounce({
		state: script.scriptCallableName,
		setState: (newName: string) => update({ scriptCallableName: newName }),
	});

	const isValidScriptCallableName = /^[a-zA-Z0-9_]+$/.test(scriptCallableNameDebounce.localDataState);

	const scriptVariables = useMemo(() => {
		const variables = getVariablesFromCode(script.content, Object.values(scripts));
		return new Map(variables.map((variableFromCode) => [variableFromCode.name, variableFromCode] as const));
	}, [script.content]);

	return (
		<>
			<EditableText
				text={script.name}
				setText={(newText: string) => update({ name: newText, id, scriptCallableName: toValidFunctionName(newText) })}
				isValidFunc={(text: string) => text.length >= 1 && (!scriptNames.has(text) || text == script.name)}
				isTitle
			/>
			<Stack direction={'row'} spacing={2}>
				<FormControl>
					<FormLabel>Script-Callable Name</FormLabel>
					<Input
						startDecorator={<Code />}
						size="md"
						variant="outlined"
						placeholder="Script-callable name goes here"
						value={scriptCallableNameDebounce.localDataState}
						error={isValidScriptCallableName}
						onChange={(e) => {
							scriptCallableNameDebounce.setLocalDataState(e.target.value);
						}}
						color={isValidScriptCallableName ? 'primary' : 'danger'}
					></Input>
				</FormControl>
				<FormControl>
					<FormLabel>Script Return Variable</FormLabel>
					<Select
						endDecorator={<AssignmentReturnedIcon />}
						size="md"
						variant="outlined"
						onChange={(_event: React.SyntheticEvent | null, newValue: string | null) => {
							const variable = scriptVariables.get(newValue as string);
							if (variable) {
								update({
									returnVariableName: newValue,
									returnVariableType: {
										isClass: variable.type === 'class',
										typeText: variable.typescriptTypeString,
									},
								});
							} else {
								update({ returnVariableName: newValue, returnVariableType: undefined });
							}
						}}
						value={script.returnVariableName}
						renderValue={(option) => {
							const variable = scriptVariables.get(option?.value as string);
							if (variable == null) {
								return option?.label;
							}
							return (
								<>
									<ListItemDecorator>{iconMap[variable.type]} </ListItemDecorator>
									{variable.name}
								</>
							);
						}}
					>
						<Option value={null}>No return</Option>
						{[...scriptVariables.values()].map((variable, index) => (
							<Option key={index} value={variable.name}>
								<ListItemDecorator>{iconMap[variable.type]} </ListItemDecorator>
								{variable.name}
							</Option>
						))}
					</Select>
				</FormControl>
				{!isRunning && (
					<Button
						color="success"
						startDecorator={<PlayCircleIcon />}
						variant="outlined"
						onClick={async () => {
							setRunning(true);
							const scriptToRun = { ...script, content: localDataState };
							const ranScript = dispatch(runScript({ script: scriptToRun, requestId: null })).unwrap();
							const timeoutPromise = new Promise<void>((resolve) => {
								setTimeout(() => resolve(), Constants.minimumScriptRunTimeMS);
							});
							await Promise.all([asyncCallWithTimeout(ranScript, settings.timeoutDurationMS), timeoutPromise]);
							const output = await ranScript;
							if (typeof output === 'function') {
								setScriptOutputLang('javascript');
								setScriptOutput((output as any).toString());
							} else {
								setScriptOutputLang('json');
								setScriptOutput(JSON.stringify(output) ?? '');
							}
							setRunning(false);
						}}
					>
						Run
					</Button>
				)}
				{isRunning && (
					<Button
						color="warning"
						startDecorator={<CancelIcon />}
						endDecorator={<CircularProgress />}
						variant="outlined"
						onClick={() => setRunning(false)}
					>
						Cancel
					</Button>
				)}
			</Stack>
			<Stack direction={'row'} spacing={2}>
				<FormatIcon actionFunction={() => format()} />
				<CopyToClipboardButton copied={copied} setCopied={setCopied} text={localDataState} />
			</Stack>
			<Editor
				height={'55vh'}
				value={localDataState}
				onChange={(value) => {
					if (value != null) {
						setLocalDataState(value);
					}
				}}
				language={'typescript'}
				theme={resolvedMode === 'dark' ? 'vs-dark' : resolvedMode}
				options={defaultEditorOptions}
				onMount={handleMainEditorDidMount}
			/>
			<Typography level="h3" sx={{ textAlign: 'center', my: '15px' }}>
				Return Variable Output
			</Typography>
			<Editor
				height={'15vh'}
				value={scriptOutput}
				language={scriptOutputLang}
				theme={resolvedMode === 'dark' ? 'vs-dark' : resolvedMode}
				options={{ readOnly: true, domReadOnly: true, ...defaultEditorOptions }}
				onMount={handleReturnEditorDidMount}
			/>
		</>
	);
}