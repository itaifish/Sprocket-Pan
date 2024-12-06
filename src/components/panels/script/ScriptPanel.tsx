import { useSelector } from 'react-redux';
import { selectScript, selectScripts, selectSettings } from '../../../state/active/selectors';
import { useAppDispatch } from '../../../state/store';
import {
	Button,
	Chip,
	CircularProgress,
	FormControl,
	FormLabel,
	Input,
	ListItemDecorator,
	Option,
	Select,
	Stack,
	Typography,
} from '@mui/joy';
import { Editor, Monaco } from '@monaco-editor/react';
import { useState, useRef, useEffect } from 'react';
import { Script } from '../../../types/application-data/application-data';
import { defaultEditorOptions } from '../../../managers/MonacoInitManager';
import { useDebounce } from '../../../hooks/useDebounce';
import { toValidFunctionName } from '../../../utils/string';
import Code from '@mui/icons-material/Code';
import AssignmentReturnedIcon from '@mui/icons-material/AssignmentReturned';
import { asyncCallWithTimeout, getVariablesFromCode, VariableFromCode } from '../../../utils/functions';
import FunctionsIcon from '@mui/icons-material/Functions';
import ClassIcon from '@mui/icons-material/Class';
import InventoryIcon from '@mui/icons-material/Inventory';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { runScript } from '../../../state/active/thunks/requests';
import { editor } from 'monaco-editor';
import { PanelProps } from '../panels.interface';
import { CopyToClipboardButton } from '../../shared/buttons/CopyToClipboardButton';
import { EditableText } from '../../shared/input/EditableText';
import { sleep } from '../../../utils/misc';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import { Constants } from '../../../constants/constants';
import { FormatButton } from '../../shared/buttons/FormatButton';
import { useEditorTheme } from '../../../hooks/useEditorTheme';
import { activeActions } from '../../../state/active/slice';

const iconMap: Record<'function' | 'variable' | 'class', JSX.Element> = {
	function: <FunctionsIcon />,
	class: <ClassIcon />,
	variable: <InventoryIcon />,
};

export function ScriptPanel({ id }: PanelProps) {
	const theme = useEditorTheme();
	const script = useSelector((state) => selectScript(state, id));
	const scripts = useSelector(selectScripts);
	const scriptNames = new Set(Object.values(scripts).map((script) => script.name));
	const [isRunning, setRunning] = useState(false);
	const [isDebouncing, setDebouncing] = useState(false);
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
		dispatch(activeActions.updateScript({ ...values, id: script.id }));
	}
	const { localDataState, setLocalDataState, debounceEventEmitter } = useDebounce({
		state: script.content,
		setState: (newText: string) => update({ content: newText }),
		debounceOverride: Constants.longEditTimeMS,
	});

	const scriptCallableNameDebounce = useDebounce({
		state: script.scriptCallableName,
		setState: (newName: string) => update({ scriptCallableName: newName }),
	});

	const isValidScriptCallableName = /^[a-zA-Z0-9_]+$/.test(scriptCallableNameDebounce.localDataState);
	const [scriptVariables, setScriptVariables] = useState<Map<string, VariableFromCode>>(new Map());

	useEffect(() => {
		const onDebounceSync = () => {
			setDebouncing(false);
		};
		const onDebounceDeSync = () => {
			setDebouncing(true);
		};
		debounceEventEmitter.on('desync', onDebounceDeSync);
		debounceEventEmitter.on('sync', onDebounceSync);
	}, []);

	useEffect(() => {
		let active = true;
		async function act() {
			const variables = await getVariablesFromCode(script.content, Object.values(scripts));
			if (!active) {
				return;
			}
			setScriptVariables(
				new Map(variables.map((variableFromCode) => [variableFromCode.name, variableFromCode] as const)),
			);
		}

		act();
		return () => {
			active = false;
		};
	}, [script.content]);
	return (
		<>
			<EditableText
				sx={{ margin: 'auto' }}
				text={script.name}
				setText={(newText: string) => update({ name: newText, id, scriptCallableName: toValidFunctionName(newText) })}
				isValidFunc={(text: string) => text.length >= 1 && (!scriptNames.has(text) || text == script.name)}
				level="h2"
			/>
			<Stack direction="row" spacing={2}>
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
				<FormControl>
					<FormLabel>Loading Status</FormLabel>
					<Chip
						endDecorator={isDebouncing ? <HourglassTopIcon /> : <ThumbUpOffAltIcon color="primary" />}
						variant="outlined"
						color={isDebouncing ? 'neutral' : 'primary'}
						size="lg"
					>
						{isDebouncing ? 'Loading' : 'Ready'}
					</Chip>
				</FormControl>
				<FormControl>
					<FormLabel>Action</FormLabel>
					{!isRunning && (
						<Button
							color="success"
							disabled={isDebouncing}
							startDecorator={<PlayCircleIcon />}
							variant="outlined"
							onClick={async () => {
								try {
									setRunning(true);
									const scriptToRun = { ...script, content: localDataState };
									const ranScript = dispatch(runScript({ script: scriptToRun, requestId: null })).unwrap();
									await Promise.all([
										asyncCallWithTimeout(ranScript, settings.scriptTimeoutDurationMS),
										sleep(Constants.minimumScriptRunTimeMS),
									]);
									const output = await ranScript;
									if (typeof output === 'function') {
										setScriptOutputLang('javascript');
										setScriptOutput((output as any).toString());
									} else {
										setScriptOutputLang('json');
										setScriptOutput(JSON.stringify(output) ?? '');
									}
								} catch (e) {
									setScriptOutputLang('json');
									setScriptOutput(JSON.stringify({ error: (e as any)?.message ?? 'An error occurred' }));
								} finally {
									setRunning(false);
								}
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
				</FormControl>
			</Stack>
			<Stack direction="row" spacing={2}>
				<FormatButton onChange={format} />
				<CopyToClipboardButton copyText={localDataState} />
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
				theme={theme}
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
				theme={theme}
				options={{ readOnly: true, domReadOnly: true, ...defaultEditorOptions }}
				onMount={handleReturnEditorDidMount}
			/>
		</>
	);
}
