import { useSelector } from 'react-redux';
import { Typography } from '@mui/joy';
import { useState, useRef } from 'react';
import { Constants } from '@/constants/constants';
import { useEditorTheme } from '@/hooks/useEditorTheme';
import { selectScript, selectScripts } from '@/state/active/selectors';
import { activeActions } from '@/state/active/slice';
import { useAppDispatch } from '@/state/store';
import { Script } from '@/types/data/workspace';
import { sleep } from '@/utils/misc';
import { toValidFunctionName } from '@/utils/string';
import { PanelProps } from '../panels.interface';
import { EditableHeader } from '../shared/EditableHeader';
import { SyncButton } from '@/components/shared/buttons/SyncButton';
import { ScriptActions } from './ScriptActions';
import { ScriptRunnerManager } from '@/managers/scripts/ScriptRunnerManager';
import { SprocketEditor } from '@/components/shared/input/monaco/SprocketEditor';
import { Panel, PanelGroup } from 'react-resizable-panels';
import { SprocketResizeHandle } from '@/components/shared/SprocketResizeHandle';
import { useDebounce } from '@/hooks/useDebounce';

export function ScriptPanel({ id }: PanelProps) {
	const interruptTrigger = useRef<null | ((message?: string) => void)>(null);
	const editorTheme = useEditorTheme();
	const script = useSelector((state) => selectScript(state, id));
	const scripts = useSelector(selectScripts);
	const scriptNames = new Set(Object.values(scripts).map((script) => script.name));
	const [isRunning, setIsRunning] = useState(false);
	const [isInterrupting, setIsInterrupting] = useState(false);
	const [scriptOutput, setScriptOutput] = useState('');
	const [scriptOutputLang, setScriptOutputLang] = useState<'json' | 'javascript'>('json');
	const dispatch = useAppDispatch();

	function update(values: Partial<Script>) {
		dispatch(activeActions.updateScript({ ...values, id: script.id }));
	}

	const { localDataState, setLocalDataState } = useDebounce({
		state: script.content,
		setState: (newText: string) => update({ content: newText }),
		debounceMS: Constants.longEditTimeMS,
	});

	const run = async () => {
		try {
			setIsRunning(true);
			const interruptible = ScriptRunnerManager.runTypescriptWithFullContext<unknown>({
				script,
			});
			interruptTrigger.current = interruptible.interrupt;
			await sleep(Constants.minimumScriptRunTimeMS);
			const output = await interruptible.result;
			if (typeof output === 'function') {
				setScriptOutputLang('javascript');
				setScriptOutput(output.toString());
			} else {
				setScriptOutputLang('json');
				setScriptOutput(JSON.stringify(output));
			}
		} catch (e) {
			setScriptOutputLang('json');
			setScriptOutput(JSON.stringify(e));
		} finally {
			interruptTrigger.current = null;
			setIsRunning(false);
			setIsInterrupting(false);
		}
	};

	const interrupt = () => {
		setIsInterrupting(true);
		interruptTrigger.current?.('requested by user');
	};

	return (
		<>
			<EditableHeader
				value={script.name}
				onChange={(name) => update({ name, id, scriptCallableName: toValidFunctionName(name) })}
				isValidFunc={(text) => text.length >= 1 && (!scriptNames.has(text) || text == script.name)}
				right={<SyncButton id={id} />}
			/>
			<PanelGroup autoSaveId={id} direction="vertical" style={{ height: 'calc(100vh - 140px)' }}>
				<Panel defaultSize={66} minSize={20}>
					<SprocketEditor
						ActionBarItems={
							<ScriptActions
								script={script}
								onChange={update}
								isRunning={isRunning}
								isInterrupting={isInterrupting}
								run={run}
								interrupt={interrupt}
							/>
						}
						value={localDataState}
						onChange={(value) => {
							if (value != null) {
								setLocalDataState(value);
							}
						}}
						language="typescript"
						theme={editorTheme}
					/>
				</Panel>
				<SprocketResizeHandle horizontal />
				<Panel defaultSize={33} minSize={10}>
					<SprocketEditor
						ActionBarItems={<Typography level="h4">Return Variable Output</Typography>}
						value={scriptOutput}
						language={scriptOutputLang}
						theme={editorTheme}
						options={{ readOnly: true, domReadOnly: true }}
						formatOnChange
					/>
				</Panel>
			</PanelGroup>
		</>
	);
}
