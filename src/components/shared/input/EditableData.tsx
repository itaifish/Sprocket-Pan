import { Badge, Box, IconButton, Stack, useColorScheme } from '@mui/joy';
import { useState, useRef, useEffect } from 'react';
import { Environment } from '../../../types/application-data/application-data';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import { Editor, Monaco } from '@monaco-editor/react';
import { defaultEditorOptions } from '../../../managers/MonacoInitManager';
import { clamp } from '../../../utils/math';
import CancelIcon from '@mui/icons-material/Cancel';
import SaveIcon from '@mui/icons-material/Save';
import { useSelector } from 'react-redux';
import { selectEnvironments, selectSelectedEnvironment } from '../../../state/active/selectors';
import { editor } from 'monaco-editor';
import { SprocketTooltip } from '../SprocketTooltip';
import { CopyToClipboardButton } from '../buttons/CopyToClipboardButton';
import { FormatIcon } from '../buttons/FormatIcon';
import { KeyValuePair, KeyValueValues, OrderedKeyValuePairs } from '../../../classes/OrderedKeyValuePairs';
import { cloneEnv, envParse } from '../../../utils/application';
import { getMode } from '../../../utils/style';

interface KeyValueObject<T extends KeyValueValues> {
	[key: string]: T | undefined;
}

export interface EditableDataSettings {
	fullSize?: boolean;
	environment?: Environment | Environment['pairs'] | OrderedKeyValuePairs;
}

interface EditableDataProps<T extends KeyValueValues> extends EditableDataSettings {
	values: KeyValuePair<T>[];
	onChange: (newData: KeyValuePair<T>[]) => void;
}

export function EditableData<T extends KeyValueValues>({
	values,
	onChange,
	fullSize,
	environment,
}: EditableDataProps<T>) {
	const resolvedMode = getMode(useColorScheme());

	const selectedEnvironment = useSelector(selectSelectedEnvironment);
	const environments = useSelector(selectEnvironments);
	environment = environment ?? (selectedEnvironment == null ? cloneEnv() : environments[selectedEnvironment]);
	const envValues =
		'set' in environment
			? environment
			: new OrderedKeyValuePairs('pairs' in environment ? environment.pairs : environment);

	const valuesAsObject = Object.fromEntries(values.map(({ key, value }) => [key, value]));

	const [editorText, setEditorText] = useState(JSON.stringify(valuesAsObject));
	const [backupEditorText, setBackupEditorText] = useState(editorText);
	const [runningTableData, setRunningTableData] = useState<KeyValueObject<T>>(valuesAsObject);
	const [hasChanged, setChanged] = useState(false);
	const [mode, setMode] = useState<'view' | 'edit'>('edit');

	const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

	const format = () => editorRef.current?.getAction('editor.action.formatDocument')?.run();

	const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor, _monaco: Monaco) => {
		editorRef.current = editor;
		format();
	};

	useEffect(() => {
		setEditorText(JSON.stringify(valuesAsObject));
		setChanged(false);
		setRunningTableData(valuesAsObject);
		format();
	}, [valuesAsObject]);

	const reset = () => {
		setEditorText(JSON.stringify(valuesAsObject));
		setChanged(false);
		setRunningTableData(valuesAsObject);
		format();
	};

	const save = () => {
		const tableData = JSON.parse(editorText);
		if (tableData != null) {
			onChange(tableData);
			setChanged(false);
		}
	};

	const getEnvParsedRunningTableData = () => {
		if (runningTableData == null) {
			return 'null';
		}
		const parsedData: KeyValueObject<string> = {};
		Object.entries(runningTableData).forEach(([key, value]) => {
			parsedData[envParse(key, envValues)] = envParse(value, envValues);
		});
		return JSON.stringify(parsedData);
	};

	return (
		<>
			<Stack direction="row" justifyContent="end" alignItems="end">
				<SprocketTooltip text={`Switch to ${mode === 'edit' ? 'View' : 'Edit'} Mode`}>
					<IconButton
						disabled={runningTableData == null}
						onClick={() => {
							if (mode === 'edit') {
								setMode('view');
								setBackupEditorText(editorText);
								setEditorText(getEnvParsedRunningTableData());
								editorRef.current?.updateOptions({ readOnly: true });
							} else {
								setMode('edit');
								setEditorText(backupEditorText);
								editorRef.current?.updateOptions({ readOnly: false });
								editorRef.current?.setValue(backupEditorText);
							}
						}}
					>
						{mode === 'edit' ? <VisibilityIcon /> : <EditIcon />}
					</IconButton>
				</SprocketTooltip>
				<SprocketTooltip text="Clear Changes">
					<IconButton disabled={!hasChanged} onClick={reset}>
						<CancelIcon />
					</IconButton>
				</SprocketTooltip>
				<SprocketTooltip text="Save Changes">
					<IconButton
						disabled={!hasChanged || runningTableData == null}
						onClick={() => {
							save();
						}}
					>
						<Badge invisible={!hasChanged || runningTableData == null} color="primary">
							<SaveIcon></SaveIcon>
						</Badge>
					</IconButton>
				</SprocketTooltip>
				<CopyToClipboardButton copyText={editorText} />
				<FormatIcon actionFunction={() => format()} />
			</Stack>
			<Box
				onKeyDown={(e) => {
					if (e.key === 's' && e.ctrlKey) {
						save();
					}
				}}
				height={'100%'}
			>
				<Editor
					height={fullSize ? '100%' : `${clamp((values.length + 2) * 3, 10, 40)}vh`}
					value={editorText}
					onChange={(value) => {
						if (value != editorText) {
							setEditorText(value ?? '');
							setChanged(true);
							setRunningTableData(value == null ? null : JSON.parse(value));
						}
					}}
					language={'json'}
					theme={resolvedMode === 'dark' ? 'vs-dark' : resolvedMode}
					options={defaultEditorOptions}
					onMount={handleEditorDidMount}
				/>
			</Box>
		</>
	);
}
