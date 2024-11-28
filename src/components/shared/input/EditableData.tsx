import { Badge, Box, IconButton, Stack, useColorScheme } from '@mui/joy';
import { useState, useRef, useEffect } from 'react';
import { createEmptyEnvironment, Environment } from '../../../types/application-data/application-data';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import { Editor, Monaco } from '@monaco-editor/react';
import { defaultEditorOptions } from '../../../managers/MonacoInitManager';
import { clamp } from '../../../utils/math';
import CancelIcon from '@mui/icons-material/Cancel';
import SaveIcon from '@mui/icons-material/Save';
import { EnvironmentContextResolver } from '../../../managers/EnvironmentContextResolver';
import { useSelector } from 'react-redux';
import { selectEnvironments, selectSelectedEnvironment } from '../../../state/active/selectors';
import { editor } from 'monaco-editor';
import { SprocketTooltip } from '../SprocketTooltip';
import { CopyToClipboardButton } from '../buttons/CopyToClipboardButton';
import { FormatIcon } from '../buttons/FormatIcon';
import { KeyValueValues, OrderedKeyValuePairs } from '../../../classes/OrderedKeyValuePairs';
import { parseOrderedKeyValuePairs } from '../../../utils/serialization';

export interface EditableDataSettings {
	fullSize?: boolean;
	environment?: Environment | Environment['values'];
}

interface EditableDataProps<T extends KeyValueValues> extends EditableDataSettings {
	values: OrderedKeyValuePairs<T>;
	onChange: (newData: OrderedKeyValuePairs<T>) => void;
}

function envParse(value: KeyValueValues | undefined, envValues: OrderedKeyValuePairs<string>) {
	if (value == null) {
		return '';
	}
	if (Array.isArray(value)) {
		value = value.join(', ');
	}
	return EnvironmentContextResolver.parseStringWithEnvironment(value, envValues)
		.map((x) => x.value)
		.join('');
}

export function EditableData<T extends KeyValueValues>({
	values,
	onChange,
	fullSize,
	environment,
}: EditableDataProps<T>) {
	const colorScheme = useColorScheme();
	const selectedMode = colorScheme.mode;
	const systemMode = colorScheme.systemMode;
	const resolvedMode = selectedMode === 'system' ? systemMode : selectedMode;
	const selectedEnvironment = useSelector(selectSelectedEnvironment);
	const environments = useSelector(selectEnvironments);
	environment =
		environment ?? (selectedEnvironment == null ? createEmptyEnvironment() : environments[selectedEnvironment]);
	const envValues = 'id' in environment ? environment.values : environment;
	const [editorText, setEditorText] = useState(values.toJSON());
	const [backupEditorText, setBackupEditorText] = useState(editorText);
	const [runningTableData, setRunningTableData] = useState<OrderedKeyValuePairs<T> | null>(values);
	const [hasChanged, setChanged] = useState(false);
	const [mode, setMode] = useState<'view' | 'edit'>('edit');
	const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
	const format = () => {
		if (editorRef.current != null) {
			editorRef.current.getAction('editor.action.formatDocument')?.run();
		}
	};
	const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor, _monaco: Monaco) => {
		editorRef.current = editor;
		format();
	};

	useEffect(() => {
		setEditorText(values.toJSON());
		setChanged(false);
		setRunningTableData(values);
	}, [values]);

	const save = () => {
		const tableData = parseOrderedKeyValuePairs<T>(editorText);
		if (tableData != null) {
			onChange(tableData);
			setChanged(false);
		}
	};

	const getEnvParsedRunningTableData = () => {
		if (runningTableData == null) {
			return 'null';
		}
		return new OrderedKeyValuePairs(
			runningTableData.toArray().map(({ key, value }) => ({
				key: envParse(key, envValues),
				value: envParse(value, envValues),
			})),
		).toJSON();
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
					<IconButton
						disabled={!hasChanged}
						onClick={() => {
							setEditorText(values.toJSON());
							setChanged(false);
							setRunningTableData(values);
							format();
						}}
					>
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
					height={fullSize ? '100%' : `${clamp((values.count() + 2) * 3, 10, 40)}vh`}
					value={editorText}
					onChange={(value) => {
						if (value != editorText) {
							setEditorText(value ?? '');
							setChanged(true);
							setRunningTableData(value ? parseOrderedKeyValuePairs<T>(value) : null);
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
